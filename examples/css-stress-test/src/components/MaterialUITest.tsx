import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function MaterialUITest() {
    return (
        <Card sx={{ minWidth: 275, margin: 2 }}>
            <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                    Material UI Test
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Components from @mui/material
                </Typography>
                <Button variant="contained">MUI Button</Button>
            </CardContent>
        </Card>
    );
}
