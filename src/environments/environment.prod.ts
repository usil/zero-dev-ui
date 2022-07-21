export const environment: {
  production: boolean;
  title: string;
  api: string;
  extraSettings?: {
    signedUserDetails?: Record<string, any>;
  };
  customSecurity: {
    useCustomSecurity: boolean;
    baseUrl: string;
    loginType: string;
    loginEndpoint: string;
    pingEndpoint: string;
    refreshEndpoint: string;
    sendTokenIn: string;
    tokenVariableName: string;
    sessionInfoConfig: {
      jsonPathToToken: string;
      jsonPathToUser: string;
      jsonPathToName: string;
      jsonPathToRoles: string;
    };
    uiConfiguration: {
      type: string;
      buttonText: string;
    };
  };
} = {
  production: true,
  title: '',
  api: '',
  customSecurity: {
    useCustomSecurity: true,
    baseUrl: '',
    loginType: 'url',
    loginEndpoint: '',
    pingEndpoint: '',
    refreshEndpoint: '',
    sendTokenIn: '',
    tokenVariableName: '',
    sessionInfoConfig: {
      jsonPathToToken: '',
      jsonPathToUser: '',
      jsonPathToName: '',
      jsonPathToRoles: '',
    },
    uiConfiguration: {
      type: '',
      buttonText: '',
    },
  },
};
