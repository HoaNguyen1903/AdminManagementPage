import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import { Add as AddIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PageHeader = ({ title, subtitle, actionLabel, onAction, breadcrumbs = [] }) => {
    const navigate = useNavigate();

    return (
        <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                    <Typography variant="h4" fontWeight="700" gutterBottom>
                        {title}
                    </Typography>
                    {breadcrumbs.length > 0 && (
                        <Breadcrumbs 
                            separator={<ChevronRightIcon sx={{ fontSize: '1rem' }} />} 
                            aria-label="breadcrumb"
                            sx={{ mb: 1 }}
                        >
                            <Link 
                                underline="hover" 
                                color="inherit" 
                                href="/" 
                                onClick={(e) => { e.preventDefault(); navigate('/'); }}
                                sx={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center' }}
                            >
                                Dashboard
                            </Link>
                            {breadcrumbs.map((b, index) => (
                                <Typography 
                                    key={index} 
                                    color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
                                    sx={{ fontSize: '0.8125rem' }}
                                >
                                    {b.label}
                                </Typography>
                            ))}
                        </Breadcrumbs>
                    )}
                </Box>

                {actionLabel && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onAction}
                        sx={{ 
                            borderRadius: 2, 
                            boxShadow: '0 8px 16px 0 rgba(0, 167, 111, 0.24)',
                            textTransform: 'none',
                            fontWeight: 700,
                            py: 1,
                            px: 2
                        }}
                    >
                        {actionLabel}
                    </Button>
                )}
            </Box>
            {subtitle && (
                <Typography variant="body2" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
};

export default PageHeader;
