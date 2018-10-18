import AWS from 'aws-sdk'
import { CognitoUserPool, CognitoUserAttribute, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js'
import { createUser, updateUserStatus } from '../utility/users';
import config from './config'

const userPool = new CognitoUserPool({
  UserPoolId: config.aws_cognito_user_pools_id,
  ClientId: config.aws_cognito_user_pools_web_client_id
})
let cognitoUser = null
let userData = null

export const MSG_PASSWORD_PATTERN = 'Password must contain at least 8 characters, one lowercase, uppercase and numeric character'
export const MSG_SERVER_ERROR = 'Internal Server Error. Please retry.'

export const checkNamePattern = (name) => {
  return name.length > 0
}

export const checkPasswordPattern = (password) => {
  return /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && (password.length >= 8)
}

export const checkEmailPattern = (email) => {
  return /\S+@\S+\.\S+/.test(email)
}

// ======================================================
//   Signin methods
// ======================================================
export function handleSignIn (username, password, callbacks) {
  const authenticationDetails = new AuthenticationDetails({
    Username: username,
    Password: password
  })
  cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool
  })

  cognitoUser.authenticateUser(authenticationDetails, callbacks)
}

export function loginCallbackFactory (callbacks, ctx) {
  return {
    onSuccess: (result) => {
      callbacks.onSuccess.call(ctx)
    },

    onFailure: (error) => {
      const displayError = checkLoginError(error)
      callbacks.onFailure.call(ctx, displayError)
    },

    mfaRequired: (codeDeliveryDetails) => {
      AWS.config.region = config.aws_cognito_region
      callbacks.mfaRequired.call(ctx)
    }
  }
}

export function sendMFAVerificationCode (code, callbacks) {
  cognitoUser.sendMFACode(code, callbacks)
}

export function checkLoginError (error) {
  const err = error.toString()
  if (/InvalidParameterException: Missing required parameter USERNAME/.test(err) ||
    (/UserNotFoundException/.test(err)) ||
    (/NotAuthorizedException/.test(err))) {
    return 'Invalid username or password.'
  } else if (/InvalidParameterException: Missing required parameter SMS_MFA_CODE/.test(err)) {
    return 'Verficiation code cannot be empty.'
  } else if (/CodeMismatchException/.test(err)) {
    return 'Invalid verification code.'
  } else if (/UserNotConfirmedException/.test(err)) {
    return 'User is not verified.'
  } else {
    return 'Internal Server Error. Please retry.'
  }
}

// ======================================================
// Signup methods
// ======================================================
export function handleSignUp (email, password, username, firstName, lastName, role, status, signUpCallback) {
  const attributeList = []
  const dataEmail = {
    Name: 'email',
    Value: email
  }
  const dataUserName = {
    Name: 'preferred_username',
    Value: username
  }
  
  const dataPassword = {
    Name: 'custom:password',
    Value: password
  }

  const attributeEmail = new CognitoUserAttribute(dataEmail)
  const attributeUserName = new CognitoUserAttribute(dataUserName)
  const attributePassword = new CognitoUserAttribute(dataPassword)

  attributeList.push(attributeEmail);
  attributeList.push(attributeUserName);
  attributeList.push(attributePassword); 

  userData = {
    email: email,
    username: username,
    firstName: firstName,
    lastName: lastName,
    role: role,
    status: status,
  }

  createUser(userData).then(() => {
    userPool.signUp(email, password, attributeList, null, signUpCallback)
  });
}

export function checkSignUpError (error) {
  const err = error.toString()
  if (/UsernameExistsException/.test(err)) {
    return 'User already exists'
  } else if (/InvalidPasswordException/.test(err) ||
      /Value at 'password' failed to satisfy constraint/.test(err)) {
    return MSG_PASSWORD_PATTERN
  } else {
    return MSG_SERVER_ERROR
  }
}

export function handleSubmitVerificationCode (username, verificationCode, verificationCallback) {
  cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool
  })

  userData.status = 'active';

  updateUserStatus(userData)
  .then(() => {
    cognitoUser.confirmRegistration(verificationCode, true, verificationCallback)  
  })
  .catch((err) => {
    console.log('Error: ', err)
  });
}

export function handleResendVerificationCode (username, resendCodeCallback) {
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool
  })
  cognitoUser.resendConfirmationCode(resendCodeCallback)
}

// ======================================================
// Forgot Password methods
// ======================================================
export function forgotPasswordFactoryCallback (forgotPasswordCallBack, ctx) {
  return {
    onSuccess: () => {
      forgotPasswordCallBack.onSuccess.call(ctx, {
        resetSuccess: true
      })
    },
    onFailure: (err) => {
      let invalidCodeOrPasswordMessage = checkResetPasswordError(err.toString())
      forgotPasswordCallBack.onFailure.call(ctx, invalidCodeOrPasswordMessage)
    },
    inputVerificationCode: (data) => {
      forgotPasswordCallBack.inputVerificationCode.call(ctx)
    }
  }
}

export function checkResetPasswordError (error) {
  if ((/UserNotFoundException/.test(error)) ||
    (/InvalidParameterException: Cannot reset password for the user as there is no registered/.test(error))) {
    return 'Invalid email'
  } else if (/LimitExceededException/.test(error)) {
    return 'Attempt limit exceeded, please try again later'
  } else if (/CodeMismatchException/.test(error)) {
    return 'Invalid Verfication Code'
  } else if (/InvalidPasswordException/.test(error)) {
    return MSG_PASSWORD_PATTERN
  } else {
    return MSG_SERVER_ERROR
  }
}

export function handleForgotPassword (username, forgotPasswordCallBack) {
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool
  })
  cognitoUser.forgotPassword(forgotPasswordCallBack)
}

export function handleForgotPasswordReset (username, verificationCode, newPassword, forgotPasswordCallBack) {
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool
  })
  cognitoUser.confirmPassword(verificationCode, newPassword, forgotPasswordCallBack)
}

// ======================================================
// SignOut methods
// ======================================================
export function handleSignOut () {
  cognitoUser = userPool.getCurrentUser()

  if (cognitoUser) {
    cognitoUser.signOut()
  }
}

// ======================================================
// Check user session still valid
// ======================================================
export function getUserSession () {
  cognitoUser = userPool.getCurrentUser()

  if (cognitoUser != null) {
    return cognitoUser.getSession(function (_err, session) {
      if (session && session.isValid) {
        return session
      }
    })
  }
}

export function checkUserAuthenticated () {
  cognitoUser = userPool.getCurrentUser()
  return cognitoUser && cognitoUser.getSession((_err, session) => session && session.isValid())
}

// current cognitor user, need to check undifined when used
export function getCurrentUser (callback) {
  const session = getUserSession()
  if (session) {
    cognitoUser.getUserAttributes((err, result) => {
      let user = {}
      // console.log(result);
      if (!err) {
        for (let i = 0; i < result.length; i++) {
          user[result[i].getName()] = result[i].getValue()
        }
      }
      callback(err, user)
    })
  }
}

export function getUser () {
  const session = getUserSession()
  // console.log(session);
  if (session) {
    return session.idToken.payload;
  } else {
    return;
  }
  
  // return cognitoUser.getUserAttributes((err, result) => {
  //   let user = {}
  //   // console.log(result);
  //   if (!err) {
  //     for (let i = 0; i < result.length; i++) {
  //       user[result[i].getName()] = result[i].getValue()
  //     }
  //   }
  //   console.log(user);
  //   return user;
  // })
}
