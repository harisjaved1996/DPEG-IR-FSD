/**
 * @description Thin controller for the IR Share Transfers screen (`irShareTransfers` LWC).
 *              Assembles the share-transfer payload (IRDTO.ShareTransferDTO) consumed by the LWC.
 *              All SOQL lives in the selector; this class orchestrates the selector and shapes the
 *              response.
 *
 *              NOTE: The Share Transfer custom fields (status, amount, units, dates, etc.) were
 *              removed from the object, so the lifecycle board, per-status KPIs and the row mapping
 *              were retired. The payload now reports a single Total Transfers KPI with an empty
 *              board and table.
 *
 * @see     IRDTO
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class ShareTransferController {
    /**
     * @description Builds the share-transfers payload: a Total Transfers KPI, an empty lifecycle
     *              board, and an empty transfer table.
     * @return A populated IRDTO.ShareTransferDTO.
     */
    @AuraEnabled(cacheable=true)
    public static IRDTO.ShareTransferDTO getShareTransfers() {
        try {
            Integer total = ShareTransferSelector.countAll();

            IRDTO.ShareTransferDTO dto = new IRDTO.ShareTransferDTO();
            dto.kpis = new List<IRDTO.MetricDTO>{ IRDTO.metricNumber('totalTransfers', 'Total Transfers', total) };
            dto.board = new List<IRDTO.TransferLaneDTO>();
            dto.transfers = new List<IRDTO.TransferRowDTO>();
            return dto;
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load share transfers. ' + e.getMessage());
        }
    }
}
