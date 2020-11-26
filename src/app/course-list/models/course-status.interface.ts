export interface ICourseStatus {

  // Total timespent on course in milliseconds
  timespent: number;

  // Timestamp of course startDate in milliseconds
  startDate: number;

  // Progress of course rounded to number in 0-100
  progress: number;

  // TOC
  toc: any;

  // Type of user
  userType: any;
};
