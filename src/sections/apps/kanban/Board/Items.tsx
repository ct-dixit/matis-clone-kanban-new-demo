import { CSSProperties, useState } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { Draggable, DraggingStyle, NotDraggingStyle } from '@hello-pangea/dnd';
import { format, isPast, isToday, differenceInDays } from 'date-fns';

// project imports
import EditStory from '../Backlogs/EditStory';
import AlertItemDelete from './AlertItemDelete';
import IconButton from 'components/@extended/IconButton';
import { getImageUrl, ImagePath } from 'utils/getImageUrl';

import { deleteItem, handlerKanbanDialog, useGetBacklogs } from 'api/kanban';
import { openSnackbar } from 'api/snackbar';
import { withAlpha } from 'utils/colorUtils';

// assets
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import ClusterOutlined from '@ant-design/icons/ClusterOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

// types
import { SnackbarProps } from 'types/snackbar';
import { KanbanItem, KanbanUserStory, KanbanProfile } from 'types/kanban';

interface Props {
  item: KanbanItem;
  index: number;
}

// item drag wrapper
const getDragWrapper = (
  isDragging: boolean,
  draggableStyle: DraggingStyle | NotDraggingStyle | undefined,
  theme: Theme,
  radius: string,
  priority: 'low' | 'medium' | 'high'
): CSSProperties | undefined => {
  const priorityColors = {
    low: theme.vars.palette.success.light,
    medium: theme.vars.palette.warning.light,
    high: theme.vars.palette.error.light
  };

  return {
    userSelect: 'none',
    margin: '0 0 8px 0',
    padding: 2,
    border: '1px solid',
    borderLeft: `4px solid ${priorityColors[priority]}`,
    borderColor: theme.vars.palette.divider,
    background: withAlpha(theme.vars.palette.background.paper, isDragging ? 0.8 : 1),
    borderRadius: radius,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: theme.shadows[4],
      transform: 'translateY(-2px)'
    },
    ...draggableStyle
  };
};

const getPriorityColor = (priority: 'low' | 'medium' | 'high', theme: Theme) => {
  const colors = {
    low: theme.vars.palette.success.main,
    medium: theme.vars.palette.warning.main,
    high: theme.vars.palette.error.main
  };
  return colors[priority];
};

const getPriorityLabel = (priority: 'low' | 'medium' | 'high') => {
  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
  };
  return labels[priority];
};

const getDueDateColor = (dueDate: Date, theme: Theme) => {
  if (!dueDate) return theme.vars.palette.text.secondary;
  const daysDiff = differenceInDays(new Date(dueDate), new Date());
  if (isPast(new Date(dueDate)) && !isToday(new Date(dueDate))) {
    return theme.vars.palette.error.main;
  }
  if (isToday(new Date(dueDate))) {
    return theme.vars.palette.warning.main;
  }
  if (daysDiff <= 3) {
    return theme.vars.palette.warning.main;
  }
  return theme.vars.palette.text.secondary;
};

// ==============================|| KANBAN BOARD - ITEMS ||============================== //

export default function Items({ item, index }: Props) {
  const { backlogs } = useGetBacklogs();

  const backProfile = !!item.image;
  const itemStory = backlogs?.userStory.filter((story: KanbanUserStory) => story?.itemIds?.filter((itemId) => itemId === item.id)[0])[0];
  
  // Get assigned user profile
  const assignedUser: KanbanProfile | undefined = item.assign
    ? backlogs?.profiles?.find((profile: KanbanProfile) => profile.id === item.assign)
    : undefined;

  // Calculate sub-task completion
  const subTasks = item.subTasks || [];
  const completedSubTasks = subTasks.filter((subTask) => subTask.completed).length;
  const subTaskProgress = subTasks.length > 0 ? (completedSubTasks / subTasks.length) * 100 : 0;

  const handlerDetails = (id: string) => {
    handlerKanbanDialog(id);
  };

  const [anchorEl, setAnchorEl] = useState<Element | (() => Element) | null | undefined>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [open, setOpen] = useState(false);
  const handleModalClose = (status: boolean) => {
    setOpen(false);
    if (status) {
      deleteItem(item.id);
      openSnackbar({
        open: true,
        message: 'Task Deleted successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
    }
  };

  const [openStoryDrawer, setOpenStoryDrawer] = useState<boolean>(false);
  const handleStoryDrawerOpen = () => {
    setOpenStoryDrawer((prevState) => !prevState);
  };

  const editStory = () => {
    setOpenStoryDrawer((prevState) => !prevState);
  };

  return (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={(theme) => ({
            ...getDragWrapper(snapshot.isDragging, provided.draggableProps.style, theme, `4px`, item.priority),
            p: 1.5
          })}
        >
          <Stack spacing={1}>
            {/* Title and Menu */}
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography
                onClick={() => handlerDetails(item.id)}
                variant="subtitle1"
                sx={{
                  display: 'inline-block',
                  width: 'calc(100% - 34px)',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  verticalAlign: 'middle',
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {item.title}
              </Typography>

              <IconButton size="small" color="secondary" onClick={handleClick} aria-controls="menu-comment" aria-haspopup="true">
                <MoreOutlined />
              </IconButton>
              <Menu
                id="menu-comment"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                variant="selectedMenu"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleClose();
                    handlerDetails(item.id);
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    setOpen(true);
                  }}
                >
                  Delete
                </MenuItem>
              </Menu>
              <AlertItemDelete title={item.title} open={open} handleClose={handleModalClose} />
            </Stack>

            {/* Description */}
            {item.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '0.75rem'
                }}
              >
                {item.description}
              </Typography>
            )}

            {/* Priority and Due Date */}
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip
                label={getPriorityLabel(item.priority)}
                size="small"
                sx={(theme) => ({
                  bgcolor: getPriorityColor(item.priority, theme),
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 20
                })}
              />
              {item.dueDate && (
                <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                  <CalendarOutlined style={{ fontSize: '0.75rem' }} />
                  <Typography
                    variant="caption"
                    sx={(theme) => ({
                      color: getDueDateColor(new Date(item.dueDate), theme),
                      fontWeight: 500,
                      fontSize: '0.7rem'
                    })}
                  >
                    {format(new Date(item.dueDate), 'MMM d, yyyy')}
                  </Typography>
                </Stack>
              )}
            </Stack>

            {/* Sub-tasks Progress */}
            {subTasks.length > 0 && (
              <Stack spacing={0.5}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Sub-tasks
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {completedSubTasks}/{subTasks.length}
                  </Typography>
                </Stack>
                <Box
                  sx={(theme) => ({
                    width: '100%',
                    height: 4,
                    bgcolor: theme.vars.palette.divider,
                    borderRadius: 1,
                    overflow: 'hidden'
                  })}
                >
                  <Box
                    sx={(theme) => ({
                      width: `${subTaskProgress}%`,
                      height: '100%',
                      bgcolor: theme.vars.palette.primary.main,
                      transition: 'width 0.3s ease-in-out'
                    })}
                  />
                </Box>
              </Stack>
            )}

            {/* Assigned User and Story */}
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              {assignedUser && (
                <Tooltip title={assignedUser.name}>
                  <Avatar
                    sx={{ width: 24, height: 24 }}
                    size="sm"
                    alt={assignedUser.name}
                    src={assignedUser.avatar && getImageUrl(`${assignedUser.avatar}`, ImagePath.USERS)}
                  />
                </Tooltip>
              )}
              {itemStory && (
                <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', justifyContent: 'flex-start', color: 'primary.dark' }}>
                  <ClusterOutlined style={{ fontSize: '0.75rem' }} />
                  <Link
                    variant="caption"
                    color="primary.dark"
                    underline="hover"
                    onClick={editStory}
                    sx={{ cursor: 'pointer', fontSize: '0.7rem' }}
                  >
                    Story #{itemStory.id}
                  </Link>
                </Stack>
              )}
            </Stack>

            {/* Image */}
            {backProfile && (
              <CardMedia
                component="img"
                image={getImageUrl(`${item.image}`, ImagePath.PROFILE)}
                sx={{ width: '100%', borderRadius: 1, mt: 0.5 }}
                title="Task image"
              />
            )}
          </Stack>
          {itemStory && (
            <EditStory story={itemStory} open={openStoryDrawer} handleDrawerOpen={handleStoryDrawerOpen} />
          )}
        </Box>
      )}
    </Draggable>
  );
}
