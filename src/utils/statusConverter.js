export default class Utils {
  /**
   * Convert daterange to type of trip: 'active' || 'upcoming' || 'soon' || 'recent || 'recap'
   * @param {Number} DateRange - Trip Daterange
   * @return {String} Type as String
   */
  static getTripTypeFromDate(dateRange) {
    // let recapTimestamp = new Date();
    // recapTimestamp.setFullYear(recapTimestamp.getFullYear() - 1);
    // recapTimestamp = Date.parse(recapTimestamp) / 1000;
    const { startDate, endDate } = dateRange;
    let now = new Date();
    now.setHours(23, 59, 59, 59);
    const nowTimeStamp = now.getTime() / 1000;

    let type = "";

    if (startDate < nowTimeStamp && endDate < nowTimeStamp) {
      type = "recent";
    } else if (startDate < nowTimeStamp && endDate > nowTimeStamp) {
      type = "active";
    } else if ((startDate - nowTimeStamp) / 86400 < 7) {
      type = "soon";
    } else if (startDate > nowTimeStamp && endDate > nowTimeStamp) {
      type = "upcoming";
    }

    return type;
  }
}
