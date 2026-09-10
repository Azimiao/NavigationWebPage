import React, { useEffect, useRef, useState } from 'react';
import fetchJsonp from 'fetch-jsonp';
import { TextField, Autocomplete, CircularProgress, Box, Select, MenuItem, Avatar, OutlinedInput } from '@mui/material';
import { makeStyles } from '@mui/styles';
import RASearchEngines from './RASearchEngines';

const useStyles = makeStyles((theme) => ({
    boxMain: {
        maxWidth: '600px',
        margin: '0 auto',
        background: "#ffffff",
        borderRadius: "4px",
        display: "flex",
        justifyContent: "center",
    },
    searchBarMain: {
        display: "inline-flex",
        width: "calc(100% - 66px)",
        borderRadius: "0px 4px 4px 0px !important",
        "& .MuiFilledInput-root": {
            borderRadius: "0px 4px 4px 0px !important",

        },
    },
    searchBoxLabel: {
        // "&.Mui-focused":{
        //    display:"none",
        //    background:"transparent",
        //    op
        // },
    },
    searchEngineSelector: {
        boxSizing: "border-box",
        width: "66px",
        padding: "0 0",
        height: "48px",
        display: "inline-flex",
        // border:"0 !important",
        background: "rgba(0, 0, 0, 0.06)",
        // boxShadow: 'none',
        borderRadius: "4px 0px 0px 4px !important",
        "& .MuiFilledInput-input": {
            display: "flex",
            paddingTop: "0 !important",
            paddingBottom: "0 !important",
            height: "100% !important",
            justifyContent: "center !important",
            alignItems: "center !important",
        },
        "&.MuiOutlinedInput-notchedOutline'": {
            // border: 0
        }
    },
    searchEngineSelectorItem: {
        // justifyContent:"center",

    },
    searchEngineSlectIcon: {
        width: "24px !important",
        height: "24px !important",
        margin: "0 auto",
    }
}));

const getSearchEngine = (index) => {
    if (RASearchEngines.length > index && RASearchEngines[index]) {
        return RASearchEngines[index];
    }
    return RASearchEngines[0] ?? null;
}

const getSearchEngineCount = () => RASearchEngines.length ?? 0;

const SearchEngineSelector = (props) => {
    const classes = useStyles();
    return (
        props.searchEngineList ?
            <Select id={"searchEngineSelect"}
                className={classes.searchEngineSelector}
                displayEmpty={true}
                variant='filled'
                // disableUnderline={true}
                defaultValue={props.defaultValue ?? 0}
                value={props.value}
                onChange={(event) => {
                    if (props.onSelectChange) {
                        props.onSelectChange(event.target.value);
                    }
                }}>
                {
                    props.searchEngineList.map((value, index) => {
                        return <MenuItem
                            key={value.name}
                            value={index}
                            className={classes.searchEngineSelectorItem}>
                            <Avatar
                                src={value.icon}
                                variant="square"
                                className={classes.searchEngineSlectIcon} />
                        </MenuItem>;
                    })
                }
            </Select>
            : <React.Fragment></React.Fragment>
    );
};


const RASearchBox = () => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [autoCompleteValue, setAutoCompleteValue] = useState('');
    const [inputValue, setInputValue] = useState('');


    const getSearchEngineIndex = () => {
        const savedEngineIndex = localStorage.getItem("RASearchEngineIndex");
        return savedEngineIndex ? parseInt(savedEngineIndex) : 0;
    }

    const [searchEngineIndex, setSearchEngineIndex] = useState(getSearchEngineIndex);

    const classes = useStyles();


    let defaultSelectValue = -1;

    useEffect(() => {
        localStorage.setItem("RASearchEngineIndex", searchEngineIndex);
    }, [searchEngineIndex]);


    useEffect(() => {
        setLoading(true);
        const getData = setTimeout(async () => {
            if (!inputValue || inputValue.length <= 0) {
                setLoading(false);
                setOptions([]);
                return;
            }

            setLoading(true);

            await getSearchEngine(searchEngineIndex).suggester(inputValue).then(result => {
                setOptions(result);
            }).catch(e => {
                console.log(e);
                setOptions([]);
            }).finally(setLoading(false));
        }, 100);
        return () => clearTimeout(getData);
    }, [inputValue, searchEngineIndex]);



    const handleInputChange = async (event, value, reason) => {
        // console.log(`handleInputChange,reason:${reason},value:${value}`);
        if (reason != "reset") {
            setInputValue(value);
        } else {
            setInputValue('');
        }
    }

    const handleOnChange = (event, value, reason) => {
        // console.log(`handleOnChange,reason:${reason},value:${value}`);
        // TODO: 此行没必要
        setAutoCompleteValue(value);
        if (reason != "clear") {
            console.log(value);
            openNewPage(getSearchEngine(searchEngineIndex).searcher(value));
            setAutoCompleteValue("");
            setInputValue("");
        }
    }

    const handleKeyDown = (event) => {
        if (event.code == "Tab") {
            event.preventDefault();
            setSearchEngineIndex(searchEngineIndex < getSearchEngineCount() - 1 ? searchEngineIndex + 1 : 0);
        }
    }

    const openNewPage = (url) => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (newWindow) {
            { newWindow.opener = null; }
        }
    }

    return (
        <Box mb={4} className={classes.boxMain} >
            <SearchEngineSelector
                className={classes.SearchEngineSelector}
                searchEngineList={RASearchEngines}
                defaultValue={defaultSelectValue < 0 ? () => { defaultSelectValue = getSearchEngineIndex(); return defaultSelectValue; } : defaultSelectValue}
                value={searchEngineIndex}
                onSelectChange={(index) => setSearchEngineIndex(index)
                } />
            <Autocomplete
                className={classes.searchBarMain}
                id="search-box"
                size='small'
                open={open}
                autoComplete={false}
                value={autoCompleteValue || ""}
                inputValue={inputValue || ""}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                isOptionEqualToValue={(option, value) => option === value}
                getOptionLabel={(option) => option}
                options={options}
                // loading={loading}
                // loadingText={"正在获取..."}
                freeSolo={true}
                disableClearable={false}
                disableCloseOnSelect={true}
                onChange={handleOnChange}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                filterOptions={(options, state) => options}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={getSearchEngine(searchEngineIndex).placeholder}
                        variant="filled"
                        InputLabelProps={{
                            className: classes.searchBoxLabel,
                        }}
                        InputProps={{
                            ...params.InputProps,
                            // startAdornment: (
                            //     <React.Fragment>
                            //         {loading ? (
                            //             <CircularProgress color="inherit" size={18} />
                            //         ) : null}
                            //         {params.InputProps.endAdornment}
                            //     </React.Fragment>
                            // ),
                            // endAdornment: (
                            //     <React.Fragment>
                            //        
                            //     </React.Fragment>
                            // ),
                        }}
                    />
                )}
            />
        </Box>
    );
};

export default RASearchBox;
