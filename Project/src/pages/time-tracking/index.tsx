
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { TimeTrackingContent } from "./components/TimeTrackingContent";

const TimeTracking = () => {
  useEffect(() => {
    console.log("Time Tracking page loaded");
  }, []);

  return (
    <>
      <Helmet>
        <title>Time Tracking | TaskFlow</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
        </div>
        <TimeTrackingContent />
      </div>
    </>
  );
};

export default TimeTracking;
