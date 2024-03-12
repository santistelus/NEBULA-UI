(async function () {
    //add avatar
     
    const styleOptions = {
        hideUploadButton: false
    };

    const tokenEndpointURL = new URL('https://default38da2016f3ea4b0abb3376eadba89b.d8.environment.api.powerplatform.com/powervirtualagents/botsbyschema/crb36_nebulaUnified/directline/token?api-version=2022-03-01-preview');
    const locale = document.documentElement.lang || 'en';
    const apiVersion = tokenEndpointURL.searchParams.get('api-version');

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

    const directLine = WebChat.createDirectLine({ domain: new URL('v3/directline', directLineURL), token });

    const subscription = directLine.connectionStatus$.subscribe({
        next(value) {
            if (value === 2) {
                directLine
                    .postActivity({
                        localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        locale,
                        name: 'startConversation',
                        type: 'event'
                    })
                    .subscribe();

                subscription.unsubscribe();
            }
        }
    });

    WebChat.renderWebChat({ directLine, locale, styleOptions }, document.getElementById('webchat'));
})();

document.addEventListener('DOMContentLoaded', function () {
    const internetSearchToggle = document.getElementById('internetSearchToggle');

    internetSearchToggle.addEventListener('click', function () {
        internetSearchToggle.classList.toggle('active');
        // Aquí puedes agregar la lógica adicional para realizar la búsqueda en Internet o cualquier otra acción que desees.
    });
});