import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

// project imports
import AddTaskModal from './AddTaskModal';
import { useGetBacklogs } from 'api/kanban';

interface Props {
  columnId: string;
}

// ==============================|| KANBAN BOARD - ADD ITEM ||============================== //

export default function AddItem({ columnId }: Props) {
  const { backlogs } = useGetBacklogs();
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <>
      <Grid container spacing={1} sx={{ mt: 2 }}>
        <Grid size={12}>
          <Button variant="dashed" color="secondary" fullWidth onClick={handleOpenModal}>
            Add Task
          </Button>
        </Grid>
      </Grid>
      <AddTaskModal
        open={openModal}
        onClose={handleCloseModal}
        columnId={columnId}
        profiles={backlogs?.profiles || []}
      />
    </>
  );
}
