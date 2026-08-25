import {
  Box,
  Container,
  Divider,
  Typography,
} from '@mui/material'

export function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        bgcolor: 'background.paper',
      }}
    >
      <Divider />

      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
        >
          © {new Date().getFullYear()} SmartSkale
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Build your next career move with us.
        </Typography>
      </Container>
    </Box>
  )
}