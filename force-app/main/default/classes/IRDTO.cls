/**
 * @description Data Transfer Object catalog for the DPEG Investor Relations read layer (Phase B).
 *
 *              All screen DTOs live here as `@AuraEnabled` inner classes so that shared shapes
 *              (MetricDTO, OfferingProgressDTO, row DTOs, ...) can be reused across all 11
 *              controllers without scattering dozens of tiny top-level files. Downstream Apex /
 *              tests reference them as `IRDTO.MetricDTO`, `IRDTO.DashboardDTO`, etc. LWC consumers
 *              receive plain JSON, so the inner-class nesting is invisible on the client.
 *
 *              KPI metrics are produced via the `metric*` factory methods, which pre-format a
 *              human-readable `displayValue` (e.g. "$8.6M", "142", "11.3%") so the UI can bind it
 *              directly. Pure data containers — no SOQL, no DML.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class IRDTO {
    // ─── KPI metric factories ────────────────────────────────────────────

    /**
     * @description Builds a currency KPI metric with a compact pre-formatted display value.
     * @param key Stable identifier for the metric.
     * @param label Human-readable label.
     * @param value Raw numeric value.
     * @return A populated MetricDTO (unit = 'currency').
     */
    public static MetricDTO metricCurrency(String key, String label, Decimal value) {
        return buildMetric(key, label, value, 'currency', formatCurrencyCompact(value));
    }

    /**
     * @description Builds a number KPI metric with a pre-formatted display value.
     * @param key Stable identifier for the metric.
     * @param label Human-readable label.
     * @param value Raw numeric value.
     * @return A populated MetricDTO (unit = 'number').
     */
    public static MetricDTO metricNumber(String key, String label, Decimal value) {
        return buildMetric(key, label, value, 'number', formatNumber(value));
    }

    /**
     * @description Builds a percent KPI metric with a pre-formatted display value.
     * @param key Stable identifier for the metric.
     * @param label Human-readable label.
     * @param value Raw numeric value (already on a 0-100 scale).
     * @return A populated MetricDTO (unit = 'percent').
     */
    public static MetricDTO metricPercent(String key, String label, Decimal value) {
        return buildMetric(key, label, value, 'percent', formatPercent(value));
    }

    private static MetricDTO buildMetric(String key, String label, Decimal value, String unit, String displayValue) {
        MetricDTO metric = new MetricDTO();
        metric.key = key;
        metric.label = label;
        metric.value = value == null ? 0 : value;
        metric.unit = unit;
        metric.displayValue = displayValue;
        return metric;
    }

    // ─── Display formatting helpers ──────────────────────────────────────

    private static String formatCurrencyCompact(Decimal value) {
        if (value == null) {
            return '$0';
        }
        Decimal magnitude = value.abs();
        if (magnitude >= 1000000) {
            return '$' + (value / 1000000).setScale(1) + 'M';
        }
        if (magnitude >= 1000) {
            return '$' + (value / 1000).setScale(1) + 'K';
        }
        return '$' + value.setScale(0);
    }

    private static String formatNumber(Decimal value) {
        return value == null ? '0' : String.valueOf(value.setScale(0));
    }

    private static String formatPercent(Decimal value) {
        return value == null ? '0%' : value.setScale(1) + '%';
    }

    // ─── Shared / reused DTOs ────────────────────────────────────────────

    /** A single KPI tile value. unit ∈ {'currency','number','percent'}. */
    public class MetricDTO {
        @AuraEnabled
        public String key;
        @AuraEnabled
        public String label;
        @AuraEnabled
        public Decimal value;
        @AuraEnabled
        public String displayValue;
        @AuraEnabled
        public String unit;
        @AuraEnabled
        public String trend;
    }

    /** An offering progress-bar row. */
    public class OfferingProgressDTO {
        @AuraEnabled
        public Id offeringId;
        @AuraEnabled
        public String name;
        @AuraEnabled
        public String offeringDisplayId;
        @AuraEnabled
        public String status;
        @AuraEnabled
        public Decimal amountRaised;
        @AuraEnabled
        public Decimal targetRaise;
        @AuraEnabled
        public Decimal raisedPct;
        @AuraEnabled
        public Integer committedInvestorCount;
        @AuraEnabled
        public Date closingDate;
    }

    /** One funnel stage with count and percentage of the first stage. */
    public class FunnelStageDTO {
        @AuraEnabled
        public String label;
        @AuraEnabled
        public Integer count;
        @AuraEnabled
        public Decimal pct;
    }

    /** One slice of a split/donut chart. */
    public class SplitSliceDTO {
        @AuraEnabled
        public String label;
        @AuraEnabled
        public Decimal amount;
        @AuraEnabled
        public Decimal pct;
        @AuraEnabled
        public String colorToken;
    }

    /** An action-queue item surfaced on the console. */
    public class ActionItemDTO {
        @AuraEnabled
        public Id recordId;
        @AuraEnabled
        public String category;
        @AuraEnabled
        public String label;
        @AuraEnabled
        public String sublabel;
        @AuraEnabled
        public Decimal amount;
        @AuraEnabled
        public String status;
        @AuraEnabled
        public String objectApiName;
    }

    /** An offering roster (investment position) row. */
    public class RosterRowDTO {
        @AuraEnabled
        public Id investmentId;
        @AuraEnabled
        public String entityName;
        @AuraEnabled
        public Decimal units;
        @AuraEnabled
        public Decimal lpCapital;
        @AuraEnabled
        public Decimal equityPct;
        @AuraEnabled
        public Decimal costBasis;
        @AuraEnabled
        public String status;
    }

    /** A contribution feed row. */
    public class ContributionRowDTO {
        @AuraEnabled
        public Id recordId;
        @AuraEnabled
        public String entityName;
        @AuraEnabled
        public Decimal amount;
        @AuraEnabled
        public String method;
        @AuraEnabled
        public String wireName;
        @AuraEnabled
        public Date contributionDate;
        @AuraEnabled
        public String matchStatus;
    }

    /** A distribution-batch list row. */
    public class BatchRowDTO {
        @AuraEnabled
        public Id recordId;
        @AuraEnabled
        public String name;
        @AuraEnabled
        public String offeringName;
        @AuraEnabled
        public String batchType;
        @AuraEnabled
        public Decimal totalAmount;
        @AuraEnabled
        public Integer investorCount;
        @AuraEnabled
        public Decimal achAmount;
        @AuraEnabled
        public Decimal chequeAmount;
        @AuraEnabled
        public String status;
        @AuraEnabled
        public Date distDate;
    }

    /** A distribution detail row (within a batch / investor detail). */
    public class DistributionRowDTO {
        @AuraEnabled
        public Id recordId;
        @AuraEnabled
        public String entityName;
        @AuraEnabled
        public Decimal equityPct;
        @AuraEnabled
        public Decimal amount;
        @AuraEnabled
        public String method;
        @AuraEnabled
        public String achStatus;
    }

    /** A commitment row. */
    public class CommitmentRowDTO {
        @AuraEnabled
        public Id recordId;
        @AuraEnabled
        public String entityName;
        @AuraEnabled
        public Decimal committedAmount;
        @AuraEnabled
        public String status;
        @AuraEnabled
        public Date commitDate;
        @AuraEnabled
        public Boolean funded;
    }

    /** A single wire row (matching feed). */
    public class WireRowDTO {
        @AuraEnabled
        public Id recordId;
        @AuraEnabled
        public String sender;
        @AuraEnabled
        public Decimal amount;
        @AuraEnabled
        public String memo;
        @AuraEnabled
        public Datetime received;
        @AuraEnabled
        public Integer confidence;
        @AuraEnabled
        public String bucket;
        @AuraEnabled
        public String matchStatus;
        @AuraEnabled
        public String matchedAccount;
    }

    /** A confidence bucket grouping a set of wires (workspace wire matching). */
    public class WireBucketDTO {
        @AuraEnabled
        public String bucket;
        @AuraEnabled
        public Integer count;
        @AuraEnabled
        public Decimal totalAmount;
        @AuraEnabled
        public List<WireRowDTO> wires;

        public WireBucketDTO() {
            this.count = 0;
            this.totalAmount = 0;
            this.wires = new List<WireRowDTO>();
        }
    }

    /** A subscription-document signature row. */
    public class SignatureRowDTO {
        @AuraEnabled
        public Id recordId;
        @AuraEnabled
        public String entityName;
        @AuraEnabled
        public String primaryStatus;
        @AuraEnabled
        public String secondaryStatus;
        @AuraEnabled
        public Boolean finalized;
        @AuraEnabled
        public String fundingInstructions;
        @AuraEnabled
        public Boolean singleSigner;
    }

    /** A waitlist row. */
    public class WaitlistRowDTO {
        @AuraEnabled
        public Id recordId;
        @AuraEnabled
        public Integer position;
        @AuraEnabled
        public String entityName;
        @AuraEnabled
        public Decimal amount;
        @AuraEnabled
        public Date added;
        @AuraEnabled
        public Boolean autoPromote;
        @AuraEnabled
        public String status;
    }

    /** A document repository row. */
    public class DocumentRowDTO {
        @AuraEnabled
        public Id recordId;
        @AuraEnabled
        public String fileName;
        @AuraEnabled
        public String category;
        @AuraEnabled
        public String offeringName;
        @AuraEnabled
        public String entityName;
        @AuraEnabled
        public Date uploaded;
        @AuraEnabled
        public Boolean portalVisible;
    }

    /** A category count tile (documents screen). */
    public class CategoryCountDTO {
        @AuraEnabled
        public String category;
        @AuraEnabled
        public Integer count;
    }

    // ─── Screen wrapper DTOs ─────────────────────────────────────────────

    /** IR Dashboard payload. */
    public class DashboardDTO {
        @AuraEnabled
        public List<MetricDTO> kpis;
        @AuraEnabled
        public List<OfferingProgressDTO> activeOfferings;
        @AuraEnabled
        public List<FunnelStageDTO> funnel;
    }

    /** IR Console payload. */
    public class ConsoleDTO {
        @AuraEnabled
        public List<MetricDTO> kpis;
        @AuraEnabled
        public List<OfferingProgressDTO> activeOfferings;
        @AuraEnabled
        public List<SplitSliceDTO> distributionSplit;
        @AuraEnabled
        public List<ActionItemDTO> actionQueue;
    }

    /** Portfolio (Active Investments) payload. */
    public class PortfolioDTO {
        @AuraEnabled
        public List<MetricDTO> kpis;
        @AuraEnabled
        public List<PortfolioCardDTO> cards;
    }

    /** A portfolio property/offering card. */
    public class PortfolioCardDTO {
        @AuraEnabled
        public Id offeringId;
        @AuraEnabled
        public String offeringName;
        @AuraEnabled
        public String propertyName;
        @AuraEnabled
        public String propertyType;
        @AuraEnabled
        public Decimal occupancyPct;
        @AuraEnabled
        public Decimal capRate;
        @AuraEnabled
        public Decimal cashOnCash;
        @AuraEnabled
        public Decimal irrToDate;
        @AuraEnabled
        public Decimal targetIrr;
        @AuraEnabled
        public Decimal lpCapital;
        @AuraEnabled
        public Integer investorCount;
        @AuraEnabled
        public Decimal distributed;
        @AuraEnabled
        public Decimal targetIrrProgressPct;
    }

    /** Offering workspace header payload. */
    public class OfferingHeaderDTO {
        @AuraEnabled
        public Id offeringId;
        @AuraEnabled
        public String name;
        @AuraEnabled
        public String offeringDisplayId;
        @AuraEnabled
        public String status;
        @AuraEnabled
        public List<String> stages;
        @AuraEnabled
        public Integer currentStageIndex;
        @AuraEnabled
        public Decimal targetRaise;
        @AuraEnabled
        public Decimal amountRaised;
        @AuraEnabled
        public Decimal raisedPct;
        @AuraEnabled
        public Decimal overbookCap;
        @AuraEnabled
        public Integer committedCount;
        @AuraEnabled
        public Date closingDate;
        @AuraEnabled
        public String gpEntity;
    }

    /** Offering property-overview tab payload. */
    public class PropertyOverviewDTO {
        @AuraEnabled
        public Id propertyId;
        @AuraEnabled
        public String name;
        @AuraEnabled
        public String propertyType;
        @AuraEnabled
        public String address;
        @AuraEnabled
        public String county;
        @AuraEnabled
        public String submarket;
        @AuraEnabled
        public Decimal rentableSqFt;
        @AuraEnabled
        public Decimal units;
        @AuraEnabled
        public Integer yearBuilt;
        @AuraEnabled
        public Integer yearRenovated;
        @AuraEnabled
        public Decimal occupancyPct;
        @AuraEnabled
        public Decimal annualNoi;
        @AuraEnabled
        public Decimal capRate;
        @AuraEnabled
        public Decimal cashOnCash;
        @AuraEnabled
        public Decimal irrToDate;
        @AuraEnabled
        public Decimal targetIrr;
        @AuraEnabled
        public String projectedExit;
        @AuraEnabled
        public Decimal lpCapital;
        @AuraEnabled
        public Decimal dpegStake;
        @AuraEnabled
        public String lender;
        @AuraEnabled
        public String debtStructure;
    }

    /** Onboarding screen payload. */
    public class OnboardingDTO {
        @AuraEnabled
        public List<MetricDTO> kpis;
        @AuraEnabled
        public List<LeadRowDTO> leads;
    }

    /** An onboarding lead-queue row. */
    public class LeadRowDTO {
        @AuraEnabled
        public Id recordId;
        @AuraEnabled
        public String name;
        @AuraEnabled
        public String channel;
        @AuraEnabled
        public String kycStatus;
        @AuraEnabled
        public String portalStatus;
        @AuraEnabled
        public Datetime created;
    }

    /** Distributions screen payload. */
    public class DistributionsDTO {
        @AuraEnabled
        public List<MetricDTO> kpis;
        @AuraEnabled
        public List<BatchRowDTO> batches;
    }

    /** Share Transfers screen payload. */
    public class ShareTransferDTO {
        @AuraEnabled
        public List<MetricDTO> kpis;
        @AuraEnabled
        public List<TransferLaneDTO> board;
        @AuraEnabled
        public List<TransferRowDTO> transfers;
    }

    /** A lifecycle lane on the share-transfer board. */
    public class TransferLaneDTO {
        @AuraEnabled
        public String status;
        @AuraEnabled
        public Integer count;
        @AuraEnabled
        public List<TransferRowDTO> items;

        public TransferLaneDTO() {
            this.count = 0;
            this.items = new List<TransferRowDTO>();
        }
    }

    /** A share-transfer table/board row. */
    public class TransferRowDTO {
        @AuraEnabled
        public Id recordId;
        @AuraEnabled
        public String name;
        @AuraEnabled
        public String fromEntity;
        @AuraEnabled
        public String toEntity;
        @AuraEnabled
        public String offeringName;
        @AuraEnabled
        public Decimal units;
        @AuraEnabled
        public Decimal amount;
        @AuraEnabled
        public String status;
        @AuraEnabled
        public String approvalStatus;
        @AuraEnabled
        public Date transferDate;
    }

    /** Documents screen payload. */
    public class DocumentsDTO {
        @AuraEnabled
        public List<MetricDTO> kpis;
        @AuraEnabled
        public List<CategoryCountDTO> categories;
        @AuraEnabled
        public List<DocumentRowDTO> docs;
    }

    /** Payments screen payload. */
    public class PaymentsDTO {
        @AuraEnabled
        public List<MetricDTO> kpis;
        @AuraEnabled
        public List<WireRowDTO> wires;
        @AuraEnabled
        public List<ContributionRowDTO> contributions;
    }

    /** An investor list row. */
    public class InvestorRowDTO {
        @AuraEnabled
        public Id recordId;
        @AuraEnabled
        public String investorName;
        @AuraEnabled
        public String tier;
        @AuraEnabled
        public Decimal lifetimeInvested;
        @AuraEnabled
        public Integer totalCommitments;
        @AuraEnabled
        public Integer entitiesCount;
        @AuraEnabled
        public String kycStatus;
        @AuraEnabled
        public Date lastActivity;
        @AuraEnabled
        public String irRep;
    }

    /** Investor detail payload. */
    public class InvestorDetailDTO {
        @AuraEnabled
        public Id investorId;
        @AuraEnabled
        public String investorName;
        @AuraEnabled
        public String tier;
        @AuraEnabled
        public String kycStatus;
        @AuraEnabled
        public List<MetricDTO> summary;
        @AuraEnabled
        public List<RosterRowDTO> positions;
        @AuraEnabled
        public List<CommitmentRowDTO> commitments;
        @AuraEnabled
        public List<DistributionRowDTO> distributions;
        @AuraEnabled
        public List<DocumentRowDTO> documents;
    }
}
