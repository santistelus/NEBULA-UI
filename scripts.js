
document.addEventListener('DOMContentLoaded', function() {
    // Agrega un evento al botón para ocultar el descargo de responsabilidad cuando se hace clic en "Aceptar"
    document.getElementById('accept-button').addEventListener('click', function() {
      document.getElementById('disclaimer-overlay').style.display = 'none';
    });
  });
  
  
  (async function () {
    const styleOptions = {
      hideUploadButton: false,
      botAvatarInitials: 'NB',          
      botAvatarBackgroundColor: 'rgb(0,25,49)',
      userAvatarBackgroundColor: 'rgba(75,40,109)',
      userAvatarInitials: 'You'
    };
    const tokenEndpointURL = new URL('https://default38da2016f3ea4b0abb3376eadba89b.d8.environment.api.powerplatform.com/powervirtualagents/botsbyschema/crb36_nebulaAi/directline/token?api-version=2022-03-01-preview');
  
    //const tokenEndpointURL = new URL('https://a1a980b40406e5c1bcb0e633542587.0e.environment.api.powerplatform.com/powervirtualagents/botsbyschema/crda6_copilot2/directline/token?api-version=2022-03-01-preview');
    //const tokenEndpointURL = new URL('https://default38da2016f3ea4b0abb3376eadba89b.d8.environment.api.powerplatform.com/powervirtualagents/botsbyschema/crb36_nebulaUnified/directline/token?api-version=2022-03-01-preview');
    const locale = document.documentElement.lang || 'en';
  
    const apiVersion = tokenEndpointURL.searchParams.get('api-version');
    const watermark = 1; 
  // console.log(tokenEndpointURL);
  // console.log(apiVersion);
    // const [directLineURL, token] = await Promise.all([
    //   fetch(new URL(`/powervirtualagents/regionalchannelsettings?api-version=${apiVersion}`, tokenEndpointURL))
      
    //     .then(response => {
    //       if (!response.ok) {
    //         throw new Error('Failed to retrieve regional channel settings.');
           
    //       }
    //       return response.json();
    //     })
    //     .then(({ channelUrlsById: { directline } }) => directline),
    //   fetch(tokenEndpointURL)
    //     .then(response => {
    //       if (!response.ok) {
    //         throw new Error('Failed to retrieve Direct Line token.');
    //       }
    //       return response.json();
    //     })
    //     .then(({ token }) => token)
    // ]);
     // If the token is empty, then we need to get the URL and token, otherwise there is an existing conversion and we need to 
        // use the existing token to retrieve the existing conversation
                // If the token is empty, then we need to get the URL and token, otherwise there is an existing conversion and we need to 
        // use the existing token to retrieve the existing conversation
        if(!sessionStorage['token']) {
          var [directLineURL, token] = await Promise.all([
            fetch(new URL(`/powervirtualagents/regionalchannelsettings?api-version=${apiVersion}`, tokenEndpointURL))
              .then(response => {
                if (!response.ok) {
                  throw new Error('Failed to retrieve regional channel settings.');
                }

                return response.json();
              })
              .then(({ channelUrlsById: { directline } }) => directline),
            fetch(tokenEndpointURL)
              .then(response => {
                if (!response.ok) {
                  throw new Error('Failed to retrieve Direct Line token.');
                }

                return response.json();
              })
              .then(({ token }) => token)
          ]);

          // The "token" variable is the credentials for accessing the current conversation.
          // To maintain conversation across page navigation, save and reuse the token.        
          sessionStorage['token'] = token;
          sessionStorage['directLineURL'] = directLineURL;
        } 
  
        // The token could have access to sensitive information about the user.
        // It must be treated like user password.
        conversationId = sessionStorage['conversationId'];  // If this is set, the there is an existing conversation to be retrieved, watermark is a const value of 1
        var directLine;
        if(conversationId) { 
          directLine = WebChat.createDirectLine({ domain: new URL('v3/directline', sessionStorage['directLineURL']), token: sessionStorage['token'], conversationId: conversationId, watermark: watermark});
        }
        else {
          directLine = WebChat.createDirectLine({ domain: new URL('v3/directline', directLineURL), token: token, watermark: watermark});
        }

    // const directLine = window.WebChat.createDirectLine({ domain: new URL('v3/directline', directLineURL), token });
  
    // const subscription = directLine.connectionStatus$.subscribe({
    //   next(value) {
    //     if (value === 2) {
    //       directLine
    //         .postActivity({
    //           localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    //           locale,
    //           name: 'startConversation',
    //           type: 'event',
    //           value: { DirectLineToken: token }
    //         })
    //         .subscribe();
    //       subscription.unsubscribe();
    //     }
    //   }
    // });
  
    // Sends "startConversation" event when the connection is established.
    const subscription = directLine.connectionStatus$.subscribe({
      next(value) {
        if (value === 2) {
          sessionStorage['conversationId'] = directLine.conversationId; // Store the conversation id to use across refreshes and page navigations
          directLine
            .postActivity({
              localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              locale,
              name: 'startConversation',
              type: 'event'
            })
            .subscribe();

          // Only send the event once, unsubscribe after the event is sent.
          subscription.unsubscribe();
        }
      }          
    });

    document.getElementById('chat-history-button').addEventListener('click', () => {
      sendEventMessage();
    });
  
    function sendEventMessage() {
      directLine.postActivity({
        type: 'event',
        name: 'PDTestEvent',
        value: token
      }).subscribe();
    }
  
    window.WebChat.renderWebChat({ directLine, locale, styleOptions }, document.getElementById('webchat'));
  })();
  