// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

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
    logOutEndpoint: string;
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
  production: false,
  title: '',
  api: '',
  customSecurity: {
    useCustomSecurity: true,
    baseUrl: '',
    loginType: 'url',
    loginEndpoint: '',
    pingEndpoint: '',
    refreshEndpoint: '',
    logOutEndpoint: '',
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
