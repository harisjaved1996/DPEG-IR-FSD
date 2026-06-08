/**
 * @description Thin controller for the IR Documents screen (`irDocuments` LWC). Assembles document
 *              KPIs (total, portal-visible, category count), per-category counts, and the
 *              (optionally category-filtered) document list into an IRDTO.DocumentsDTO. All SOQL
 *              lives in selectors; this class orchestrates selector calls and maps results to DTOs.
 *
 * @see     IRDTO
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class DocumentController {
    /**
     * @description Builds the documents payload: KPI tiles, category counts, and the document list
     *              (filtered by category when supplied; blank category returns all).
     * @param category The Category__c value to filter the list by, or null/blank for all.
     * @return A populated IRDTO.DocumentsDTO.
     */
    @AuraEnabled(cacheable=true)
    public static IRDTO.DocumentsDTO getDocuments(String category) {
        try {
            List<IRDTO.CategoryCountDTO> categories = buildCategoryCounts(IRDocumentSelector.countGroupedByCategory());

            IRDTO.DocumentsDTO dto = new IRDTO.DocumentsDTO();
            dto.kpis = new List<IRDTO.MetricDTO>{
                IRDTO.metricNumber('totalDocuments', 'Total Documents', IRDocumentSelector.countAll()),
                IRDTO.metricNumber('portalVisible', 'Portal Visible', IRDocumentSelector.countPortalVisible()),
                IRDTO.metricNumber('categories', 'Categories', categories.size())
            };
            dto.categories = categories;
            dto.docs = IRMapper.toDocumentRows(IRDocumentSelector.selectByCategory(category));
            return dto;
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load documents. ' + e.getMessage());
        }
    }

    /**
     * @description Maps the grouped-by-category aggregate to category count tiles. Pure in-memory
     *              mapping over the aggregate rows.
     */
    private static List<IRDTO.CategoryCountDTO> buildCategoryCounts(List<AggregateResult> categoryGroups) {
        List<IRDTO.CategoryCountDTO> counts = new List<IRDTO.CategoryCountDTO>();
        if (categoryGroups == null) {
            return counts;
        }
        for (AggregateResult ar : categoryGroups) {
            IRDTO.CategoryCountDTO dto = new IRDTO.CategoryCountDTO();
            String category = (String) ar.get('category');
            dto.category = String.isBlank(category) ? 'Uncategorized' : category;
            dto.count = IRMapper.aggInt(ar.get('recordCount'));
            counts.add(dto);
        }
        return counts;
    }
}
