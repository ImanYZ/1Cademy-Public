import { Box, Button, Link, Tooltip } from "@mui/material";
import { collection, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { IOntology, ISubOntology } from "src/types/IOntology";

import useConfirmDialog from "@/hooks/useConfirmDialog";

type ISubOntologyProps = {
  subOntology: ISubOntology;
  openOntology: IOntology;
  sx: any;
  type: string;
  setOpenOntology: (openOntology: any) => void;
  saveSubOntology: any;
  setSnackbarMessage: (message: any) => void;
  category: string;
  ontologyPath: any;
  updateUserDoc: any;
  recordLogs: any;
};

const SubOntology = ({
  subOntology,
  sx,
  type,
  openOntology,
  category,
  ontologyPath,
  updateUserDoc,
  recordLogs,
}: ISubOntologyProps) => {
  const db = getFirestore();
  const { confirmIt, ConfirmDialog } = useConfirmDialog();

  const linkNavigation = async () => {
    await updateUserDoc([...ontologyPath.map((p: { id: string; title: string }) => p.id), subOntology.id]);
    // handleLinkNavigation({ id: subOntology.id, title: subOntology.title });
  };

  const removeSubOntology = ({ ontologyData, id }: any) => {
    for (let type in ontologyData.subOntologies) {
      for (let category in ontologyData.subOntologies[type] || {}) {
        if ((ontologyData.subOntologies[type][category].ontologies || []).length > 0) {
          const subOntologyIdx = ontologyData.subOntologies[type][category].ontologies.findIndex(
            (sub: any) => sub.id === id
          );
          if (subOntologyIdx !== -1) {
            ontologyData.subOntologies[type][category].ontologies.splice(subOntologyIdx, 1);
          }
        }
      }
    }
  };
  const deleteSubOntologyEditable = async () => {
    try {
      if (await confirmIt("Are you sure you want to delete?")) {
        const ontologyDoc = await getDoc(doc(collection(db, "ontology"), openOntology.id));
        if (ontologyDoc.exists()) {
          const ontologyData = ontologyDoc.data();
          const subOntologyIdx = (ontologyData?.subOntologies[type][category]?.ontologies || []).findIndex(
            (sub: any) => sub.id === subOntology.id
          );
          if (subOntologyIdx !== -1) {
            ontologyData.subOntologies[type][category].ontologies.splice(subOntologyIdx, 1);
          }
          const subOntologyDoc = await getDoc(doc(collection(db, "ontology"), subOntology.id));

          if (subOntologyDoc.exists()) {
            const subOntologyData = subOntologyDoc.data();
            const parents = subOntologyData?.parents || [];
            if (type === "Specializations") {
              for (let parent of parents) {
                const ontologyDoc = await getDoc(doc(collection(db, "ontology"), parent));
                if (ontologyDoc.exists()) {
                  const ontologyData = ontologyDoc.data();
                  removeSubOntology({ ontologyData, id: subOntology.id, subtype: type });
                  await updateDoc(ontologyDoc.ref, ontologyData);
                }
              }
            }

            if (type === "Specializations") {
              await updateDoc(subOntologyDoc.ref, { deleted: true });
            }
            await recordLogs({
              action: "Deleted a field",
              field: subOntologyData.title,
              ontology: ontologyDoc.id,
            });
          }

          await updateDoc(ontologyDoc.ref, ontologyData);
        }
        // setOpenOntology((openOntology: any) => {
        //   const _openOntology: any = { ...openOntology };
        //   const subOntologyIdx = _openOntology.subOntologies[type].findIndex((sub: any) => sub.id === subOntology.id);
        //   if (subOntologyIdx !== -1) {
        //     _openOntology.subOntologies[type].splice(subOntologyIdx, 1);
        //   }
        //   return _openOntology;
        // });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box key={subOntology.id} sx={{ ...sx }}>
      <Box key={subOntology.id} style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
        <Link
          underline="hover"
          onClick={linkNavigation}
          sx={{
            cursor: "pointer",
            color: theme =>
              theme.palette.mode === "dark" ? theme.palette.common.gray50 : theme.palette.common.notebookMainBlack,
          }}
        >
          {" "}
          {subOntology.title}
        </Link>
        <Tooltip title={"Delete"}>
          <Button onClick={deleteSubOntologyEditable} sx={{ ml: "5px" }}>
            Delete
          </Button>
        </Tooltip>
      </Box>

      {ConfirmDialog}
    </Box>
  );
};

export default SubOntology;
