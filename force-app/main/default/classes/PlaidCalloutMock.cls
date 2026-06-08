/**
 * @description HttpCalloutMock for tests that exercise code paths calling the ASB/Plaid endpoint.
 *
 *              Usage in test classes:
 *                  Test.setMock(HttpCalloutMock.class, new PlaidCalloutMock());
 *                  // or simulate a failure:
 *                  Test.setMock(HttpCalloutMock.class, new PlaidCalloutMock(false));
 *
 *              Default behaviour: returns HTTP 200 with a successful Plaid transfer response.
 *              Pass false to the constructor to simulate a Plaid failure (HTTP 422).
 *
 * @author  DPEG Project Team
 * @since   API 66.0
 */
@isTest
public class PlaidCalloutMock implements HttpCalloutMock {
    private Boolean isSuccess;

    public PlaidCalloutMock() {
        this.isSuccess = true;
    }

    public PlaidCalloutMock(Boolean isSuccess) {
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
                        'transfer_id' => 'transfer_test_' + String.valueOf(Math.random()).replace('.', ''),
                        'status' => 'pending',
                        'amount' => '100.00',
                        'network' => 'ach',
                        'created' => String.valueOf(Datetime.now())
                    }
                )
            );
        } else {
            response.setStatusCode(422);
            response.setBody(
                JSON.serialize(
                    new Map<String, Object>{
                        'error_code' => 'TRANSFER_INSUFFICIENT_FUNDS',
                        'error_message' => 'Mock: insufficient funds in funding account',
                        'request_id' => 'mock-request-id-001'
                    }
                )
            );
        }

        return response;
    }
}
