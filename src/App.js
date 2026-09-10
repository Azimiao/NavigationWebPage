import React from 'react';
import { Box, Chip } from '@mui/material';
import LogoBox from './Components/LogoBox/LogoBox';
import SearchExperience from './Components/SearchBox/SearchExperience';
import BookmarkWorkspace from './Components/Bookmarks/BookmarkWorkspace';
import './App.css';

function App() {
    return (
        <main className="app-shell">
            <div className="background-scene" aria-hidden="true" />
            <div className="background-wash" aria-hidden="true" />
            <div className="app-content">
                <section className="hero-section">
                    <LogoBox />
                    <SearchExperience />
                </section>
                <Box className="workspace-card"><BookmarkWorkspace /></Box>
                <footer className="app-footer"><span>梓喵出没导航页</span><Chip size="small" label="Made by ChatGPT" className="ready-chip" /></footer>
            </div>
        </main>
    );
}

export default App;
