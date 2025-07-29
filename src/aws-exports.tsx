const awsConfig = {
  Auth: {
    region: 'us-east-2', // tu región
    userPoolId: 'us-east-2_jghvbf7k2',
    userPoolWebClientId: '1757s9m6km1pm08409p2k2i3ta',
    oauth: {
      domain: 'chatapp-login.auth.us-east-1.amazoncognito.com',
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'https://<tu-app>.amplifyapp.com/',
      redirectSignOut: 'https://<tu-app>.amplifyapp.com/',
      responseType: 'code', // Authorization code flow
    },
  },
};

export default awsConfig;
