import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Typography, 
    Tabs, 
    Tab, 
    CircularProgress, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    MenuItem,
    Alert,
    Snackbar
} from '@mui/material';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { characterService } from '../api/services';

const CharactersPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal & Form State
    const [openModal, setOpenModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Filtering State
    const [filters, setFilters] = useState({
        lockedState: ''
    });

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setFilters({ lockedState: '' }); // Reset filters when tab changes
    };

    const columnsMap = {
        0: [
            { id: 'characterId', label: 'ID', minWidth: 50 },
            { id: 'moveRange', label: 'Move Range', minWidth: 100 },
            { id: 'maxHealth', label: 'Max Health', minWidth: 100 },
        ],
        1: [
            { id: 'characterTacticId', label: 'Tactic ID', minWidth: 100 },
            { id: 'name', label: 'Name', minWidth: 150 },
            { id: 'description', label: 'Description', minWidth: 250 },
        ],
        2: [
            { id: 'characterPassiveId', label: 'Passive ID', minWidth: 100 },
            { id: 'name', label: 'Name', minWidth: 150 },
            { id: 'description', label: 'Description', minWidth: 250 },
            { id: 'lockedState', label: 'Locked', minWidth: 100, format: (v) => v ? 'Yes' : 'No' },
        ],
        3: [
            { id: 'characterSkillId', label: 'Skill ID', minWidth: 100 },
            { id: 'name', label: 'Name', minWidth: 150 },
            { id: 'damage', label: 'Damage', minWidth: 100 },
            { id: 'sp', label: 'SP', minWidth: 80 },
            { id: 'yuanPressure', label: 'Yuan Pressure', minWidth: 120 },
            { id: 'lockedState', label: 'Locked', minWidth: 100, format: (v) => v ? 'Yes' : 'No' },
        ],
        4: [
            { id: 'characterAttackId', label: 'Attack ID', minWidth: 100 },
            { id: 'name', label: 'Name', minWidth: 150 },
            { id: 'damage', label: 'Damage', minWidth: 100 },
            { id: 'ap', label: 'AP', minWidth: 80 },
            { id: 'yuanPressure', label: 'Yuan Pressure', minWidth: 120 },
            { id: 'lockedState', label: 'Locked', minWidth: 100, format: (v) => v ? 'Yes' : 'No' },
        ]
    };

    const fetchData = async (tab) => {
        setLoading(true);
        try {
            let res;
            const params = filters.lockedState !== '' ? { lockedState: filters.lockedState } : {};
            
            switch (tab) {
                case 0: res = await characterService.getStats(); break;
                case 1: res = await characterService.getPvPs(); break;
                case 2: res = await characterService.getPassives(params); break;
                case 3: res = await characterService.getSkills(params); break;
                case 4: res = await characterService.getAttacks(params); break;
                default: break;
            }
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch character data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(tabValue);
    }, [tabValue, filters]);

    const handleCreate = () => {
        setCurrentItem(null);
        let initialData = {};
        switch (tabValue) {
            case 0: initialData = { moveRange: 0, maxHealth: 100 }; break;
            case 1: initialData = { characterTacticId: '', name: '', description: '' }; break;
            case 2: initialData = { name: '', description: '', lockedState: 0 }; break;
            case 3: initialData = { name: '', description: '', damage: 0, sp: 0, yuanPressure: 0, critDmg: 0, critRate: 0, lockedState: 0 }; break;
            case 4: initialData = { name: '', description: '', damage: 0, ap: 0, yuanPressure: 0, critDmg: 0, critRate: 0, lockedState: 0 }; break;
        }
        setFormData(initialData);
        setError(null);
        setOpenModal(true);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        let editData = { ...item };
        setFormData(editData);
        setError(null);
        setOpenModal(true);
    };

    const handleSave = async () => {
        try {
            setError(null);
            if (currentItem) {
                // Update
                const id = currentItem.characterId || currentItem.characterTacticId || currentItem.characterPassiveId || currentItem.characterSkillId || currentItem.characterAttackId;
                switch (tabValue) {
                    case 0: await characterService.updateStat(id, formData); break;
                    case 1: await characterService.updatePvP(id, formData); break;
                    case 2: await characterService.updatePassive(id, formData); break;
                    case 3: await characterService.updateSkill(id, formData); break;
                    case 4: await characterService.updateAttack(id, formData); break;
                }
                setSuccess('Updated successfully!');
            } else {
                // Create
                switch (tabValue) {
                    case 0: await characterService.createStat(formData); break;
                    case 1: await characterService.createPvP(formData); break;
                    case 2: await characterService.createPassive(formData); break;
                    case 3: await characterService.createSkill(formData); break;
                    case 4: await characterService.createAttack(formData); break;
                }
                setSuccess('Created successfully!');
            }
            setOpenModal(false);
            fetchData(tabValue);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save data. Please check your inputs.');
        }
    };

    const renderFormFields = () => {
        switch (tabValue) {
            case 0: // Stats
                return (
                    <>
                        {!currentItem && (
                            <TextField
                                margin="dense"
                                label="Character ID"
                                type="number"
                                fullWidth
                                value={formData.characterId || ''}
                                onChange={(e) => setFormData({ ...formData, characterId: parseInt(e.target.value) })}
                                helperText="This must be a unique ID for the character."
                            />
                        )}
                        <TextField
                            margin="dense"
                            label="Move Range"
                            type="number"
                            fullWidth
                            value={formData.moveRange}
                            onChange={(e) => setFormData({ ...formData, moveRange: parseInt(e.target.value) })}
                        />
                        <TextField
                            margin="dense"
                            label="Max Health"
                            type="number"
                            fullWidth
                            value={formData.maxHealth}
                            onChange={(e) => setFormData({ ...formData, maxHealth: parseInt(e.target.value) })}
                        />
                    </>
                );
            case 1: // PvP
                return (
                    <>
                        {!currentItem && (
                            <TextField
                                margin="dense"
                                label="Character Tactic ID"
                                type="number"
                                fullWidth
                                value={formData.characterTacticId || ''}
                                onChange={(e) => setFormData({ ...formData, characterTacticId: parseInt(e.target.value) })}
                                helperText="This must match an existing Character ID from Stats."
                            />
                        )}
                        <TextField
                            margin="dense"
                            label="Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </>
                );
            case 2: // Passives
                return (
                    <>
                        <TextField
                            margin="dense"
                            label="Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <TextField
                            select
                            margin="dense"
                            label="Locked State"
                            fullWidth
                            value={formData.lockedState}
                            onChange={(e) => setFormData({ ...formData, lockedState: parseInt(e.target.value) })}
                        >
                            <MenuItem value={0}>Available</MenuItem>
                            <MenuItem value={1}>Locked</MenuItem>
                        </TextField>
                    </>
                );
            case 3: // Skills
            case 4: // Attacks
                return (
                    <>
                        <TextField
                            margin="dense"
                            label="Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                margin="dense"
                                label="Damage"
                                type="number"
                                fullWidth
                                value={formData.damage}
                                onChange={(e) => setFormData({ ...formData, damage: parseInt(e.target.value) })}
                            />
                            <TextField
                                margin="dense"
                                label={tabValue === 3 ? "SP" : "AP"}
                                type="number"
                                fullWidth
                                value={tabValue === 3 ? formData.sp : formData.ap}
                                onChange={(e) => setFormData({ ...formData, [tabValue === 3 ? 'sp' : 'ap']: parseInt(e.target.value) })}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                margin="dense"
                                label="Yuan Pressure"
                                type="number"
                                fullWidth
                                value={formData.yuanPressure}
                                onChange={(e) => setFormData({ ...formData, yuanPressure: parseInt(e.target.value) })}
                            />
                            <TextField
                                select
                                margin="dense"
                                label="Locked State"
                                fullWidth
                                value={formData.lockedState}
                                onChange={(e) => setFormData({ ...formData, lockedState: parseInt(e.target.value) })}
                            >
                                <MenuItem value={0}>Available</MenuItem>
                                <MenuItem value={1}>Locked</MenuItem>
                            </TextField>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                margin="dense"
                                label="Crit Dmg (%)"
                                type="number"
                                fullWidth
                                value={formData.critDmg}
                                onChange={(e) => setFormData({ ...formData, critDmg: parseInt(e.target.value) })}
                            />
                            <TextField
                                margin="dense"
                                label="Crit Rate (%)"
                                type="number"
                                fullWidth
                                value={formData.critRate}
                                onChange={(e) => setFormData({ ...formData, critRate: parseInt(e.target.value) })}
                            />
                        </Box>
                    </>
                );
            default: return null;
        }
    };

    const getTabTitle = () => {
        switch (tabValue) {
            case 0: return 'Character Stat';
            case 1: return 'Character PvP';
            case 2: return 'Character Passive';
            case 3: return 'Character Skill';
            case 4: return 'Character Attack';
            default: return 'Character Data';
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <PageHeader 
                title="Characters" 
                subtitle="Manage character statistics, abilities, and tactics"
                actionLabel={`Create ${getTabTitle()}`}
                onAction={handleCreate}
                breadcrumbs={[{ label: 'Characters' }]}
            />

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="character data tabs">
                    <Tab label="Stats" />
                    <Tab label="PvP" />
                    <Tab label="Passives" />
                    <Tab label="Skills" />
                    <Tab label="Attacks" />
                </Tabs>
            </Box>

            {/* Filter UI for tabs 2, 3, 4 */}
            {(tabValue >= 2) && (
                <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        select
                        size="small"
                        label="Locked State"
                        value={filters.lockedState}
                        onChange={(e) => setFilters({ ...filters, lockedState: e.target.value })}
                        sx={{ width: 150 }}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value={0}>Available</MenuItem>
                        <MenuItem value={1}>Locked</MenuItem>
                    </TextField>
                    <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => setFilters({ lockedState: '' })}
                        disabled={filters.lockedState === ''}
                    >
                        Clear Filter
                    </Button>
                </Box>
            )}
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <DataTable
                    columns={columnsMap[tabValue]}
                    data={data}
                    onEdit={handleEdit}
                    searchPlaceholder={`Search ${getTabTitle().toLowerCase()}s...`}
                />
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {currentItem ? `Edit ${getTabTitle()}` : `Create ${getTabTitle()}`}
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                            {error}
                        </Alert>
                    )}
                    {renderFormFields()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Feedback Notifications */}
            <Snackbar 
                open={!!success} 
                autoHideDuration={4000} 
                onClose={() => setSuccess(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CharactersPage;
