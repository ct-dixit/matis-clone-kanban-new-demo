// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

// ==============================|| APPLICATION - INVENTORY ||============================== //

export default function InventoryPage() {
  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'inventory' }
  ];

  return (
    <>
      <Breadcrumbs custom heading="Inventory Management" links={breadcrumbLinks} />
      <Grid container spacing={3}>
        <Grid size={12}>
          <MainCard>
            <Stack spacing={2}>
              <Typography variant="h3">Inventory Management</Typography>
              <Typography variant="body1" color="text.secondary">
                Inventory management page is coming soon. This page will allow you to manage your inventory items, track stock levels, and monitor product availability.
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}


