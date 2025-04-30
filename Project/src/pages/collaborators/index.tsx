
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { CollaboratorsContent } from "./components/CollaboratorsContent";

const Collaborators = () => {
  useEffect(() => {
    console.log("Collaborators page loaded");
  }, []);

  return (
    <>
      <Helmet>
        <title>Collaborators | TaskFlow</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Collaborators</h1>
        </div>
        <CollaboratorsContent />
      </div>
    </>
  );
};

export default Collaborators;
