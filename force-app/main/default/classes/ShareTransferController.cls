/**
 * @description Thin controller for the IR Share Transfers screen (`irShareTransfers` LWC).
 *              Assembles share-transfer KPIs, a lifecycle board (lanes grouped by status), and the
 *              flat transfer table into an IRDTO.ShareTransferDTO. The grouped-by-status aggregate
 *              feeds the KPI/lane counts; the full list feeds the board lane items and the table.
 *              All SOQL lives in selectors; this class orchestrates selectors and groups records
 *              into lanes in memory.
 *
 * @see     IRDTO
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class ShareTransferController {
    /**
     * @description Builds the share-transfers payload: KPI tiles, lifecycle board, and table.
     * @return A populated IRDTO.ShareTransferDTO.
     */
    @AuraEnabled(cacheable=true)
    public static IRDTO.ShareTransferDTO getShareTransfers() {
        try {
            List<AggregateResult> statusGroups = ShareTransferSelector.countGroupedByStatus();
            List<Share_Transfer__c> allTransfers = ShareTransferSelector.selectAll();

            IRDTO.ShareTransferDTO dto = new IRDTO.ShareTransferDTO();
            dto.kpis = buildKpis(statusGroups);
            dto.board = buildBoard(allTransfers);
            dto.transfers = IRMapper.toTransferRows(allTransfers);
            return dto;
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load share transfers. ' + e.getMessage());
        }
    }

    /**
     * @description Builds KPI tiles: a Total Transfers tile plus one tile per lifecycle status.
     *              Pure in-memory mapping over the grouped aggregate.
     */
    private static List<IRDTO.MetricDTO> buildKpis(List<AggregateResult> statusGroups) {
        List<IRDTO.MetricDTO> kpis = new List<IRDTO.MetricDTO>();
        Integer total = 0;

        if (statusGroups != null) {
            for (AggregateResult ar : statusGroups) {
                String status = (String) ar.get('status');
                Integer count = IRMapper.aggInt(ar.get('recordCount'));
                total += count;
                String label = String.isBlank(status) ? 'Unspecified' : status;
                String key = 'status_' + (String.isBlank(status) ? 'unspecified' : status);
                kpis.add(IRDTO.metricNumber(key, label, count));
            }
        }

        kpis.add(0, IRDTO.metricNumber('totalTransfers', 'Total Transfers', total));
        return kpis;
    }

    /**
     * @description Builds the lifecycle board by grouping transfer rows into lanes keyed by status.
     *              Pure in-memory grouping over already-queried records (lane count = lane size).
     */
    private static List<IRDTO.TransferLaneDTO> buildBoard(List<Share_Transfer__c> transfers) {
        Map<String, IRDTO.TransferLaneDTO> byStatus = new Map<String, IRDTO.TransferLaneDTO>();
        if (transfers == null) {
            return new List<IRDTO.TransferLaneDTO>();
        }

        for (Share_Transfer__c t : transfers) {
            String statusKey = String.isBlank(t.Status__c) ? 'Unspecified' : t.Status__c;

            IRDTO.TransferLaneDTO lane = byStatus.get(statusKey);
            if (lane == null) {
                lane = new IRDTO.TransferLaneDTO();
                lane.status = statusKey;
                byStatus.put(statusKey, lane);
            }

            lane.items.add(IRMapper.toTransferRow(t));
            lane.count += 1;
        }

        return byStatus.values();
    }
}
