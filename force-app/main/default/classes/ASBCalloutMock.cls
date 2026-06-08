/**
 * @description HttpCalloutMock for tests that exercise code paths calling the Avanza Service Bus (ASB).
 *
 *              Use this mock for non-Plaid ASB callouts (Yardi sync trigger, CoStar pull, Procore update, etc.)
 *              Use PlaidCalloutMock specifically for Plaid distribution/contribution paths.
 *
 *              Usage in test classes:
 *                  Test.setMock(HttpCalloutMock.class, new ASBCalloutMock());
 *                  // or simulate an ASB failure:
 *                  Test.setMock(HttpCalloutMock.class, new ASBCalloutMock(false));
 *
 *              Default behaviour: returns HTTP 200 with a generic ASB acknowledgement.
 *              Pass false to the constructor to simulate ASB unavailability (HTTP 503).
 *
 * @author  DPEG Project Team
 * @since   API 66.0
 */
@isTest
public class ASBCalloutMock implements HttpCalloutMock {
    private Boolean isSuccess;

    public ASBCalloutMock() {
        this.isSuccess = true;
    }

    public ASBCalloutMock(Boolean isSuccess) {
        this.isSuccess = isSuccess;
    }

    public HttpResponse respond(HttpRequest request) {
        HttpResponse response = new HttpResponse();
        response.setHeader('Content-Type', 'application/json');

        if (isSuccess) {
            response.setStatusCode(200);
            response.setBody(
                JSON.serialize(
                    new Map<String, Object>{
                        'status' => 'accepted',
                        'message_id' => 'asb-msg-' + String.valueOf(Math.random()).replace('.', ''),
                        'timestamp' => String.valueOf(Datetime.now())
                    }
                )
            );
        } else {
            response.setStatusCode(503);
            response.setBody(
                JSON.serialize(
                    new Map<String, Object>{
                        'error' => 'SERVICE_UNAVAILABLE',
                        'message' => 'Mock: ASB is temporarily unavailable',
                        'retryAfter' => 60
                    }
                )
            );
        }

        return response;
    }
}
