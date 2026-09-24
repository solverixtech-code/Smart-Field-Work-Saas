DELETE FROM "IncentivePayout"
WHERE "calculationId" IN (
  SELECT "id" FROM "IncentiveCalculation" WHERE "totalIncentive" <= 0
);

DELETE FROM "IncentiveCalculation" WHERE "totalIncentive" <= 0;
