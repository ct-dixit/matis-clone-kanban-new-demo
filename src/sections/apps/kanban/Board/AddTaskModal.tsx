import { useState } from 'react';

// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';

// third-party
import * as yup from 'yup';
import { useFormik } from 'formik';
import { Chance } from 'chance';
import { addDays } from 'date-fns';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import IconButtonExtended from 'components/@extended/IconButton';
import { getImageUrl, ImagePath } from 'utils/getImageUrl';

import { addItem } from 'api/kanban';
import { openSnackbar } from 'api/snackbar';

// assets
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';

// types
import { SnackbarProps } from 'types/snackbar';
import { KanbanItem, KanbanProfile, KanbanSubTask } from 'types/kanban';

interface Props {
  open: boolean;
  onClose: () => void;
  columnId: string;
  profiles: KanbanProfile[];
}

const chance = new Chance();

const validationSchema = yup.object({
  title: yup.string().required('Task title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().max(500, 'Description must be less than 500 characters'),
  priority: yup.string().oneOf(['low', 'medium', 'high'], 'Invalid priority').required('Priority is required'),
  dueDate: yup.date().nullable(),
  assign: yup.string().nullable()
});

// ==============================|| KANBAN BOARD - ADD TASK MODAL ||============================== //

export default function AddTaskModal({ open, onClose, columnId, profiles }: Props) {
  const [subTasks, setSubTasks] = useState<KanbanSubTask[]>([]);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      priority: 'medium' as 'low' | 'medium' | 'high',
      dueDate: addDays(new Date(), 7) as Date | null,
      assign: '' as string | undefined
    },
    validationSchema,
    onSubmit: (values) => {
      const newItem: KanbanItem = {
        id: `${chance.integer({ min: 1000, max: 9999 })}`,
        title: values.title,
        description: values.description,
        priority: values.priority,
        dueDate: values.dueDate || new Date(),
        assign: values.assign || undefined,
        image: false,
        attachments: [],
        subTasks: subTasks.length > 0 ? subTasks : undefined,
        lastUpdated: new Date()
      };

      addItem(columnId, newItem, '0');
      openSnackbar({
        open: true,
        message: 'Task Added successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);

      // Reset form
      formik.resetForm();
      setSubTasks([]);
      onClose();
    }
  });

  const handleAddSubTask = () => {
    const newSubTask: KanbanSubTask = {
      id: `subtask-${chance.integer({ min: 1000, max: 9999 })}`,
      title: '',
      completed: false
    };
    setSubTasks([...subTasks, newSubTask]);
  };

  const handleRemoveSubTask = (id: string) => {
    setSubTasks(subTasks.filter((task) => task.id !== id));
  };

  const handleSubTaskChange = (id: string, field: 'title' | 'completed', value: string | boolean) => {
    setSubTasks(
      subTasks.map((task) => {
        if (task.id === id) {
          return { ...task, [field]: value };
        }
        return task;
      })
    );
  };

  const handleClose = () => {
    formik.resetForm();
    setSubTasks([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ p: 1, py: 1.5 }}>
          <DialogTitle>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Add New Task</span>
              <IconButtonExtended color="secondary" onClick={handleClose} size="small">
                <CloseOutlined />
              </IconButtonExtended>
            </Stack>
          </DialogTitle>
          <form onSubmit={formik.handleSubmit}>
            <DialogContent>
              <Grid container spacing={2.5}>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel>Title *</InputLabel>
                    <TextField
                      fullWidth
                      id="title"
                      name="title"
                      placeholder="Enter task title"
                      value={formik.values.title}
                      onChange={formik.handleChange}
                      error={formik.touched.title && Boolean(formik.errors.title)}
                      helperText={formik.touched.title && formik.errors.title}
                    />
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel>Description</InputLabel>
                    <TextField
                      fullWidth
                      id="description"
                      name="description"
                      multiline
                      rows={3}
                      placeholder="Enter task description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                    />
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel>Assign to</InputLabel>
                    <Autocomplete
                      id="assign"
                      fullWidth
                      autoHighlight
                      options={profiles || []}
                      value={profiles?.find((profile: KanbanProfile) => profile?.id === formik.values.assign) || null}
                      getOptionLabel={(option) => (option && option.name ? option.name : '')}
                      isOptionEqualToValue={(option, value) => {
                        if (!option || !value) return false;
                        return option.id === value.id;
                      }}
                      renderOption={({ key, ...props }, option) => {
                        if (!option) return null;
                        return (
                          <Box key={key} component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                            <CardMedia
                              component="img"
                              sx={{ width: 20 }}
                              loading="lazy"
                              src={option.avatar ? getImageUrl(`${option.avatar}`, ImagePath.USERS) : ''}
                              alt="avatar"
                            />
                            {option.name || ''}
                          </Box>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name="assign"
                          placeholder="Choose an assignee"
                          slotProps={{
                            htmlInput: {
                              ...params.inputProps,
                              autoComplete: 'new-password'
                            }
                          }}
                        />
                      )}
                      onChange={(event, value) => {
                        formik.setFieldValue('assign', value && value.id ? value.id : '');
                      }}
                    />
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel>Priority *</InputLabel>
                    <FormControl>
                      <RadioGroup
                        row
                        aria-label="priority"
                        value={formik.values.priority}
                        onChange={formik.handleChange}
                        name="priority"
                        id="priority"
                      >
                        <FormControlLabel
                          value="low"
                          control={<Radio color="primary" sx={{ color: 'success.main' }} />}
                          label="Low"
                        />
                        <FormControlLabel
                          value="medium"
                          control={<Radio color="warning" sx={{ color: 'warning.main' }} />}
                          label="Medium"
                        />
                        <FormControlLabel
                          value="high"
                          control={<Radio color="error" sx={{ color: 'error.main' }} />}
                          label="High"
                        />
                      </RadioGroup>
                    </FormControl>
                    {formik.touched.priority && formik.errors.priority && (
                      <FormHelperText error>{formik.errors.priority}</FormHelperText>
                    )}
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel>Due Date</InputLabel>
                    <DesktopDatePicker
                      value={formik.values.dueDate}
                      format="dd/MM/yyyy"
                      onChange={(date) => formik.setFieldValue('dueDate', date)}
                      slots={{ openPickerIcon: () => <CalendarOutlined /> }}
                    />
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <InputLabel>Sub-tasks</InputLabel>
                      <Button
                        startIcon={<PlusOutlined />}
                        size="small"
                        variant="outlined"
                        onClick={handleAddSubTask}
                        sx={{ minWidth: 'auto' }}
                      >
                        Add
                      </Button>
                    </Stack>
                    {subTasks.length > 0 && (
                      <Stack spacing={1}>
                        {subTasks.map((subTask) => (
                          <Stack key={subTask.id} direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                            <Checkbox
                              checked={subTask.completed}
                              onChange={(e) => handleSubTaskChange(subTask.id, 'completed', e.target.checked)}
                              size="small"
                            />
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Sub-task title"
                              value={subTask.title}
                              onChange={(e) => handleSubTaskChange(subTask.id, 'title', e.target.value)}
                            />
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveSubTask(subTask.id)}
                            >
                              <DeleteOutlined />
                            </IconButton>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 2.5, pb: 2 }}>
              <Button color="error" onClick={handleClose}>
                Cancel
              </Button>
              <AnimateButton>
                <Button variant="contained" type="submit">
                  Add Task
                </Button>
              </AnimateButton>
            </DialogActions>
          </form>
        </Box>
      </LocalizationProvider>
    </Dialog>
  );
}

