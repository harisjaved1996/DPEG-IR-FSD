// Phase B controller smoke test — confirms aggregates/DTO shaping run without runtime errors against seed data.
void run(String name, System.Callable nope) {}
List<String> results = new List<String>();
try { Object d = IRDashboardController.getDashboard();      results.add('Dashboard OK'); } catch (Exception e) { results.add('Dashboard FAIL: ' + e.getMessage()); }
try { Object c = IRConsoleController.getConsole();          results.add('Console OK'); } catch (Exception e) { results.add('Console FAIL: ' + e.getMessage()); }
try { Object p = PortfolioController.getPortfolio();        results.add('Portfolio OK'); } catch (Exception e) { results.add('Portfolio FAIL: ' + e.getMessage()); }
try { Object o = OnboardingController.getOnboarding();      results.add('Onboarding OK'); } catch (Exception e) { results.add('Onboarding FAIL: ' + e.getMessage()); }
try { Object di = DistributionsController.getDistributions(18); results.add('Distributions OK'); } catch (Exception e) { results.add('Distributions FAIL: ' + e.getMessage()); }
try { Object st = ShareTransferController.getShareTransfers(); results.add('ShareTransfers OK'); } catch (Exception e) { results.add('ShareTransfers FAIL: ' + e.getMessage()); }
try { Object dc = DocumentController.getDocuments(null);    results.add('Documents OK'); } catch (Exception e) { results.add('Documents FAIL: ' + e.getMessage()); }
try { Object pm = PaymentsController.getPayments(18);       results.add('Payments OK'); } catch (Exception e) { results.add('Payments FAIL: ' + e.getMessage()); }
try { Object il = InvestorListController.getInvestors(null); results.add('InvestorList OK'); } catch (Exception e) { results.add('InvestorList FAIL: ' + e.getMessage()); }
System.debug('SMOKE_RESULTS>>> ' + String.join(results, ' | '));
