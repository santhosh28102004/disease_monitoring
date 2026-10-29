const Report = require('../models/Report');
const Case = require('../models/Case');
const Alert = require('../models/Alert');
const Disease = require('../models/Disease');
const Location = require('../models/Location');

exports.getDashboardStatistics = async (req, res, next) => {
  try {
    const totalReports = await Report.countDocuments();
    const verifiedCases = await Report.countDocuments({ status: 'VERIFIED' });
    const activeCases = await Case.countDocuments({ status: 'ACTIVE' });
    const resolvedCases = await Case.countDocuments({ status: 'RESOLVED' });
    const pendingReports = await Report.countDocuments({ status: 'PENDING' });
    const totalAlerts = await Alert.countDocuments({ status: 'ACTIVE' });
    const criticalAreas = await Alert.countDocuments({ riskLevel: 'CRITICAL' });
    const totalDiseases = await Disease.countDocuments();

    res.json({
      totalReports,
      verifiedCases,
      activeCases,
      resolvedCases,
      pendingReports,
      totalAlerts,
      highRiskAreas: criticalAreas,
      totalDiseases,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDiseaseTrends = async (req, res, next) => {
  try {
    const reports = await Report.find({ status: { $in: ['VERIFIED', 'ACTIVE'] } })
      .populate('disease')
      .lean();

    const diseaseMap = {};
    reports.forEach((report) => {
      const diseaseName = report.disease.diseaseName;
      diseaseMap[diseaseName] = (diseaseMap[diseaseName] || 0) + 1;
    });

    const trends = Object.entries(diseaseMap).map(([disease, cases]) => ({
      disease,
      cases,
    }));

    res.json(trends);
  } catch (error) {
    next(error);
  }
};

exports.getLocationStatistics = async (req, res, next) => {
  try {
    const reports = await Report.find({ status: { $in: ['VERIFIED', 'ACTIVE'] } })
      .populate('location')
      .lean();

    const locationMap = {};
    reports.forEach((report) => {
      const locationName = report.location.area;
      locationMap[locationName] = (locationMap[locationName] || 0) + 1;
    });

    const stats = Object.entries(locationMap).map(([location, cases]) => ({
      location,
      cases,
    }));

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

exports.getSeverityStatistics = async (req, res, next) => {
  try {
    const reports = await Report.find({ status: { $in: ['VERIFIED', 'ACTIVE'] } });

    const severityMap = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    reports.forEach((report) => {
      severityMap[report.severity]++;
    });

    res.json(severityMap);
  } catch (error) {
    next(error);
  }
};

exports.getCaseStatusStatistics = async (req, res, next) => {
  try {
    const pending = await Report.countDocuments({ status: 'PENDING' });
    const verified = await Report.countDocuments({ status: 'VERIFIED' });
    const active = await Case.countDocuments({ status: 'ACTIVE' });
    const resolved = await Case.countDocuments({ status: 'RESOLVED' });
    const rejected = await Report.countDocuments({ status: 'REJECTED' });

    res.json({
      PENDING: pending,
      VERIFIED: verified,
      ACTIVE: active,
      RESOLVED: resolved,
      REJECTED: rejected,
    });
  } catch (error) {
    next(error);
  }
};

exports.getHighRiskAreas = async (req, res, next) => {
  try {
    const reports = await Report.find({ status: { $in: ['VERIFIED', 'ACTIVE'] } })
      .populate(['location', 'disease'])
      .lean();

    const areaMap = {};

    reports.forEach((report) => {
      const key = `${report.location._id}-${report.disease._id}`;
      if (!areaMap[key]) {
        areaMap[key] = {
          area: report.location.area,
          disease: report.disease.diseaseName,
          cases: 0,
          location: report.location._id,
        };
      }
      areaMap[key].cases++;
    });

    const riskThresholds = {
      CRITICAL: 30,
      HIGH: 16,
      MEDIUM: 6,
      LOW: 0,
    };

    const highRiskAreas = Object.values(areaMap)
      .map((area) => {
        let riskLevel = 'LOW';
        if (area.cases > riskThresholds.CRITICAL) {
          riskLevel = 'CRITICAL';
        } else if (area.cases > riskThresholds.HIGH) {
          riskLevel = 'HIGH';
        } else if (area.cases > riskThresholds.MEDIUM) {
          riskLevel = 'MEDIUM';
        }
        return { ...area, riskLevel };
      })
      .filter((area) => area.riskLevel !== 'LOW')
      .sort((a, b) => b.cases - a.cases);

    res.json(highRiskAreas);
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const AuditLog = require('../models/AuditLog');
    const logs = await AuditLog.find()
      .populate('user')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    next(error);
  }
};
