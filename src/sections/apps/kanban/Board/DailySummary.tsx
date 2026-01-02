import { useMemo } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

// third-party
import { format, isAfter, subDays } from 'date-fns';

// project imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import { getImageUrl, ImagePath } from 'utils/getImageUrl';
import { useGetBacklogs } from 'api/kanban';

// assets
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';

// types
import { KanbanItem, KanbanProfile, KanbanColumn } from 'types/kanban';

// ==============================|| KANBAN BOARD - DAILY SUMMARY ||============================== //

export default function DailySummary() {
  const { backlogs } = useGetBacklogs();

  const recentTasks = useMemo(() => {
    if (!backlogs?.items || !backlogs?.columns) return [];

    const yesterday = subDays(new Date(), 1);
    const tasks = backlogs.items.filter((item: KanbanItem) => {
      if (!item.lastUpdated) return false;
      const lastUpdated = new Date(item.lastUpdated);
      return isAfter(lastUpdated, yesterday);
    });

    // Get column info for each task
    return tasks.map((task: KanbanItem) => {
      const column = backlogs.columns.find((col: KanbanColumn) => col.itemIds.includes(task.id));
      const assignedUser = task.assign ? backlogs.profiles?.find((profile: KanbanProfile) => profile.id === task.assign) : undefined;

      return {
        ...task,
        columnTitle: column?.title || 'Unknown',
        assignedUser
      };
    });
  }, [backlogs]);

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error'
    };
    return colors[priority];
  };

  if (recentTasks.length === 0) {
    return (
      <MainCard title="Daily Summary" content={false}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No tasks updated in the last 24 hours
          </Typography>
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title="Daily Summary" content={false}>
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Tasks updated in the last 24 hours ({recentTasks.length})
        </Typography>
        <Stack spacing={2}>
          {recentTasks.map((task: any, index: number) => (
            <Box key={task.id}>
              <Card
                variant="outlined"
                sx={{
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 2,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {task.title}
                      </Typography>
                      <Chip
                        label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        size="small"
                        color={getPriorityColor(task.priority) as 'success' | 'warning' | 'error'}
                        sx={{ fontWeight: 600, fontSize: '0.7rem', height: 20 }}
                      />
                    </Stack>

                    {task.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {task.description.length > 100 ? `${task.description.substring(0, 100)}...` : task.description}
                      </Typography>
                    )}

                    <Stack direction="row" sx={{ alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                        <CalendarOutlined style={{ fontSize: '0.875rem', color: 'inherit' }} />
                        <Typography variant="caption" color="text.secondary">
                          {task.columnTitle}
                        </Typography>
                      </Stack>

                      {task.dueDate && (
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                          <CalendarOutlined style={{ fontSize: '0.875rem', color: 'inherit' }} />
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </Typography>
                        </Stack>
                      )}

                      {task.lastUpdated && (
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                          <ClockCircleOutlined style={{ fontSize: '0.875rem', color: 'inherit' }} />
                          <Typography variant="caption" color="text.secondary">
                            Updated {format(new Date(task.lastUpdated), 'MMM d, h:mm a')}
                          </Typography>
                        </Stack>
                      )}

                      {task.assignedUser && (
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                          <Avatar
                            sx={{ width: 20, height: 20 }}
                            size="sm"
                            alt={task.assignedUser.name}
                            src={task.assignedUser.avatar && getImageUrl(`${task.assignedUser.avatar}`, ImagePath.USERS)}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {task.assignedUser.name}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
              {index < recentTasks.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Stack>
      </Box>
    </MainCard>
  );
}
