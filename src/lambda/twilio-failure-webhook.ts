import { twiml } from 'twilio';

exports.handler = async (event: any) => {
    console.log(JSON.stringify(event, null, 4));

    try {
        const method = event.httpMethod;

        if (method === 'POST' && event.path === '/failure') {
            const twilioRes = new twiml.MessagingResponse();
            twilioRes.message(`Sorry, something went wrong.`);
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'text/xml'
                },
                body: twilioRes.toString()
            };
        }

        return {
            statusCode: 400,
            headers: {},
            body: 'We only accept POST /failure'
        };
    } catch (error: any) {
        const body = error.stack || JSON.stringify(error, null, 4);
        return {
            statusCode: 400,
            headers: {},
            body: JSON.stringify(body)
        };
    }
};
