
document.addEventListener('DOMContentLoaded', function() {
    // Agrega un evento al botón para ocultar el descargo de responsabilidad cuando se hace clic en "Aceptar"
    document.getElementById('accept-button').addEventListener('click', function() {
      document.getElementById('disclaimer-overlay').style.display = 'none';
    });
  });
  
  
  
  ////////
  
  (async function () {
    const styleOptions = {
      hideUploadButton: false
    };
    const tokenEndpointURL = new URL('https://default38da2016f3ea4b0abb3376eadba89b.d8.environment.api.powerplatform.com/powervirtualagents/botsbyschema/crb36_nebulaAi/directline/token?api-version=2022-03-01-preview');
  
    //const tokenEndpointURL = new URL('https://a1a980b40406e5c1bcb0e633542587.0e.environment.api.powerplatform.com/powervirtualagents/botsbyschema/crda6_copilot2/directline/token?api-version=2022-03-01-preview');
    //const tokenEndpointURL = new URL('https://default38da2016f3ea4b0abb3376eadba89b.d8.environment.api.powerplatform.com/powervirtualagents/botsbyschema/crb36_nebulaUnified/directline/token?api-version=2022-03-01-preview');
    const locale = document.documentElement.lang || 'en';
  
    const apiVersion = tokenEndpointURL.searchParams.get('api-version');
 
  console.log(tokenEndpointURL);
  console.log(apiVersion);
    const [directLineURL, token] = await Promise.all([
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
  
    const directLine = window.WebChat.createDirectLine({ domain: new URL('v3/directline', directLineURL), token });
  
    const subscription = directLine.connectionStatus$.subscribe({
      next(value) {
        if (value === 2) {
          directLine
            .postActivity({
              localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              locale,
              name: 'startConversation',
              type: 'event',
              value: { DirectLineToken: token }
            })
            .subscribe();
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
  