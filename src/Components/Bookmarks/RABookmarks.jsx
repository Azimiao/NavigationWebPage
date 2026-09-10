import React, { useEffect, useState } from 'react';
import { IconButton, Container, Box, TextField, Grid, Paper, Typography, Avatar, Dialog, DialogTitle, DialogContent, Link as MuiLink } from '@mui/material';
import { makeStyles } from "@mui/styles";
import FolderIcon from '@mui/icons-material/Folder';
import CloseIcon from '@mui/icons-material/Close';
import RABookmarkList from './RABookmarkList';
import { observer } from 'mobx-react';
import LinkIcon from '@mui/icons-material/Link';
import WebIcon from '@mui/icons-material/Web';
import Image from 'mui-image';

const useStyles = makeStyles((theme) => ({
    boxMain: {
        minHeight: '285px',
        height: '35%',
        maxHeight: "35%",
        height: '378px',
        overflowY: 'auto',
        padding: '10px',
        maxWidth: '600px',
        margin: '1em auto',
        // background: 'black'
    },


    bookmark: {
        padding: '5px',
        height: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        background: 'transparent !important',
        boxShadow: 'none !important',
        transition: 'none !important',
        "&:hover": {
            background: "#0000001a !important",
        }
    },
    bookmarkBox: {
        width: "40px !important",
        height: "40px !important",
        marginTop: "0.5em",
        marginBottom: '0.5em',
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "5px",
        overflow: "hidden",
    },
    bookmarkIcon: {
        width: "40px !important",
        height: "40px !important",
        borderRadius: "5px !important"

    },
    bookmarkTitle: {
        fontSize: "1em !important",
        color: "white",
        // fontWeight:"600 !important",
        textShadow: "1px 1px 2px #000000f0 !important",
    },

    dialog: {

    },

    dialogIframePanel:{
        position: 'absolute',
        margin:"auto",
        transform: 'translate(-50%, -50%)',
        left: "50%",
        top: " 50%",
        width:"50%",
        zIndex:"3",
    },

    dialogTitle: {
        padding: '0.2em 0.2em 0.2em 0.5em !important',

    },

    dialogContent: {
        boxSizing: "border-box",
        maxWidth: '600px',
        width: 'auto',
        //  margin: '0 auto',
        padding: '8',
    },

    dialogIframeContent:{
        boxSizing: "border-box",
        maxWidth: '100%',
        width: '100%',
        //  margin: '0 auto',
        padding: '0 !important',
        overflowY:"hidden !important",
        borderBottom:"0 !important"
    },

    dialogIframeDom:{
        width:"100%",
        height:"100%",
        minHeight:"500px",
        border:'0',
        margin:'0',
        overflow:"hidden",
        display:"block"
    },

    dialogTitleLayout: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: "1.5em"
    },
    dialogTitleIcon: {
        width: "1em",
        height: "1em",
    },
    dialogTitleText: {
        fontSize: "1em !important",
    },
    dialogBookmarkTitle: {
        fontSize: "0.85em !important",
        color: "black",
        maxWidth: "80px",
    }
}));


const BookmarkDialog = ({ open, onItemClick, onClose, folder }) => {

    const classes = useStyles();
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className={classes.dialog}>
            <DialogTitle component={"h5"} className={classes.dialogTitle}>
                <div className={classes.dialogTitleLayout}>
                    <FolderIcon className={classes.dialogTitleIcon} />
                    <Typography variant="h6" className={classes.dialogTitleText}>
                        {folder.title}
                    </Typography>
                    <IconButton onClick={onClose} color="inherit">
                        <CloseIcon />
                    </IconButton>
                </div>
            </DialogTitle>
            <DialogContent dividers className={classes.dialogContent}>
                <Grid className={classes.dialogContentGrid} container spacing={2} style={{ maxHeight: '380px' }}>
                    {folder.bookmarks.map(bookmark => (
                        <Grid item xs={3} sm={3} md={2} lg={2} key={bookmark.id}>
                            <Paper
                                className={classes.bookmark}
                                onClick={() => onItemClick(bookmark)}
                            >
                                <Box className={classes.bookmarkBox}>
                                    {
                                        bookmark.logo && bookmark.logo.length > 0 ?
                                            <Image
                                                src={bookmark.logo}
                                                className={classes.bookmarkIcon}
                                                duration={500}
                                            >
                                            </Image>
                                            : <LinkIcon className={classes.bookmarkIcon}></LinkIcon>
                                    }
                                </Box>
                                <Typography
                                    noWrap
                                    className={classes.dialogBookmarkTitle}
                                >{bookmark.title}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
        </Dialog>
    );
}

const BookmarkIframeDialog = ({ open, onClose, bookmark }) => {

    const classes = useStyles();
    return (
        <Paper open={open} onClose={onClose} maxWidth="md" fullWidth className={classes.dialogIframePanel}>
            <DialogTitle component={"h5"} className={classes.dialogTitle}>
                <div className={classes.dialogTitleLayout}>
                    <WebIcon className={classes.dialogTitleIcon} />
                    <Typography variant="h6" className={classes.dialogTitleText}>
                        {bookmark.title}
                    </Typography>
                    <IconButton onClick={onClose} color="inherit">
                        <CloseIcon />
                    </IconButton>
                </div>
            </DialogTitle>
            <DialogContent dividers className={classes.dialogIframeContent}>
            <iframe className={classes.dialogIframeDom} src={bookmark.url}></iframe>
            </DialogContent>
        </Paper>
    );
}




const RABookmarks = observer((props) => {

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);

    const [openIframe,setOpenIframe] = useState(false);
    const [selectedIframe,setSelectedIframe] = useState(null);

    const handleFolderClick = (folder) => {
        setSelectedFolder(folder);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedFolder(null);
    };

    const handleIframeDialogClick = (bookmark)=>{
        setSelectedIframe(bookmark);
        setOpenIframe(true);
        handleDialogClose();
    };

    const handleIframeDialogClose = ()=>{
        setOpenIframe(false);
        setSelectedIframe(null);

    };

    const handleSiteClick = (bookmark) => {

        if (bookmark.iframe) {
            handleIframeDialogClick(bookmark);
        } else {
            window.open(bookmark.url, '_blank');
        }
    };

    const handleItemOnClick =(bookmark) =>{
        console.log(bookmark);
        if(bookmark.type === 'folder'){
            handleFolderClick(bookmark);
        }else{
            handleSiteClick(bookmark);
        }
    }

    useEffect(() => {

        if (!RABookmarkList.isLoading) {
            RABookmarkList.requestData();
        }
    }, []);

    const classes = useStyles();
    return (

        <Box className={classes.boxMain} >
            <Grid container spacing={2}>
                {
                    RABookmarkList.allBookMarks.length > 0 ?
                        RABookmarkList.allBookMarks.map(bookmark => (
                            <Grid item xs={3} sm={3} md={2} lg={2} key={bookmark.id}>
                                <Paper
                                    className={classes.bookmark}
                                    onClick={()=>handleItemOnClick(bookmark)}
                                >   <Box className={classes.bookmarkBox}>
                                        {bookmark.type === 'folder' ? (
                                            <FolderIcon className={classes.bookmarkIcon} />
                                        ) : (
                                            bookmark.logo && bookmark.logo.length > 0 ?
                                                <Image
                                                    src={bookmark.logo}
                                                    className={classes.bookmarkIcon}
                                                    duration={500}
                                                >
                                                </Image>
                                                : <LinkIcon className={classes.bookmarkIcon}></LinkIcon>
                                        )}
                                    </Box>
                                    <Typography noWrap className={classes.bookmarkTitle} >{bookmark.title}</Typography>

                                </Paper>
                            </Grid>
                        ))
                        : <React.Fragment></React.Fragment>
                }
            </Grid>
            {selectedFolder && <BookmarkDialog open={openDialog} onItemClick={handleItemOnClick} onClose={handleDialogClose} folder={selectedFolder} />}
            {selectedIframe && <BookmarkIframeDialog open={openIframe} onClose={handleIframeDialogClose} bookmark={selectedIframe}></BookmarkIframeDialog>}
        </Box>
    )
});

export default RABookmarks;
