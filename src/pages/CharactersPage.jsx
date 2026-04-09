import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, CircularProgress } from '@mui/material';
import DataTable from '../components/DataTable';
import { characterService } from '../api/services';

const CharactersPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
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
            switch (tab) {
                case 0: res = await characterService.getStats(); break;
                case 1: res = await characterService.getPvPs(); break;
                case 2: res = await characterService.getPassives(); break;
                case 3: res = await characterService.getSkills(); break;
                case 4: res = await characterService.getAttacks(); break;
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
    }, [tabValue]);

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Characters</Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="character data tabs">
                    <Tab label="Stats" />
                    <Tab label="PvP" />
                    <Tab label="Passives" />
                    <Tab label="Skills" />
                    <Tab label="Attacks" />
                </Tabs>
            </Box>
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <DataTable
                    columns={columnsMap[tabValue]}
                    data={data}
                    disableActions
                    searchPlaceholder="Search character data..."
                />
            )}
        </Box>
    );
};

export default CharactersPage;
