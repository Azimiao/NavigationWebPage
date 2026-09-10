import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { observer } from 'mobx-react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AppsRoundedIcon from '@mui/icons-material/AppsRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import RABookmarkList from './BookmarkDataStore';

const SiteIcon = ({ item, className = '' }) => {
    const [failed, setFailed] = useState(false);
    if (item.type === 'folder') return <FolderRoundedIcon className={`site-icon folder-icon ${className}`} />;
    if (item.logo && !failed) return <img className={`site-icon ${className}`} src={item.logo} alt="" onError={() => setFailed(true)} />;
    return <span className={`site-icon fallback-icon ${className}`}>{(item.title || '?').slice(0, 1).toUpperCase()}</span>;
};

const BookmarkTile = ({ bookmark, onOpen }) => (
    <button className="bookmark-tile" type="button" onClick={() => onOpen(bookmark)} title={bookmark.title}>
        <span className="bookmark-icon-wrap"><SiteIcon item={bookmark} /></span>
        <span className="bookmark-tile-title">{bookmark.title}</span>
        <span className={`open-mode ${bookmark.iframe ? 'mode-window' : 'mode-external'}`} aria-label={bookmark.iframe ? '在本页打开' : '打开新页面'}>
            {bookmark.iframe ? <LanguageRoundedIcon /> : <OpenInNewRoundedIcon />}
        </span>
    </button>
);

const BookmarkGroup = ({ group, onOpen, collapsed, onToggle }) => {
    if (!group.items.length) return null;
    return (
        <section className="bookmark-group">
            <button className="group-heading" type="button" onClick={onToggle} aria-expanded={!collapsed}>
                <span className="group-heading-icon"><FolderRoundedIcon /></span>
                <span className="group-heading-copy"><strong>{group.title}</strong><small>{group.items.length} 个项目</small></span>
                <ExpandMoreRoundedIcon className={collapsed ? 'is-collapsed' : ''} />
            </button>
            {!collapsed && <div className="bookmark-grid">{group.items.map((bookmark) => <BookmarkTile key={bookmark.id} bookmark={bookmark} onOpen={onOpen} />)}</div>}
        </section>
    );
};

const FolderSheet = ({ folder, onClose, onOpen }) => {
    if (!folder) return null;
    return (
        <div className="folder-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <section className="folder-sheet" role="dialog" aria-modal="true" aria-label={`${folder.title} 文件夹`}>
                <header className="folder-sheet-header">
                    <div className="folder-sheet-title"><FolderRoundedIcon /><div><strong>{folder.title}</strong><span>{folder.bookmarks?.length || 0} 个项目</span></div></div>
                    <button className="window-control close-control" type="button" onClick={onClose} aria-label="关闭文件夹"><CloseRoundedIcon /></button>
                </header>
                <div className="folder-sheet-grid">
                    {(folder.bookmarks || []).map((bookmark) => <BookmarkTile key={bookmark.id} bookmark={bookmark} onOpen={onOpen} />)}
                </div>
            </section>
        </div>
    );
};

const WebWindow = ({ webWindow, onFocus, onClose, onMinimize, onToggleMaximize, onMove, onResize }) => {
    const dragRef = useRef(null);
    const resizeRef = useRef(null);
    const windowRef = useRef(webWindow);
    const onMoveRef = useRef(onMove);
    const onResizeRef = useRef(onResize);
    const { bookmark } = webWindow;
    windowRef.current = webWindow;
    onMoveRef.current = onMove;
    onResizeRef.current = onResize;

    const moveWindow = useCallback((event) => {
        if (!dragRef.current) return;
        onMoveRef.current(windowRef.current.id, {
            left: dragRef.current.left + event.clientX - dragRef.current.x,
            top: dragRef.current.top + event.clientY - dragRef.current.y,
        });
    }, []);

    const stopDragging = useCallback(() => {
        document.removeEventListener('mousemove', moveWindow);
        document.removeEventListener('mouseup', stopDragging);
        dragRef.current = null;
    }, [moveWindow]);

    const resizeWindow = useCallback((event) => {
        if (!resizeRef.current) return;
        const { x, y, width, height, direction } = resizeRef.current;
        const deltaX = event.clientX - x;
        const deltaY = event.clientY - y;
        const nextWidth = direction.includes('right') ? width + deltaX : width;
        const nextHeight = direction.includes('bottom') ? height + deltaY : height;
        onResizeRef.current(windowRef.current.id, {
            width: Math.max(340, Math.min(nextWidth, window.innerWidth - windowRef.current.left - 12)),
            height: Math.max(230, Math.min(nextHeight, window.innerHeight - windowRef.current.top - 12)),
        });
    }, []);

    const stopResizing = useCallback(() => {
        resizeRef.current = null;
        document.removeEventListener('pointermove', resizeWindow);
        document.removeEventListener('pointerup', stopResizing);
    }, [resizeWindow]);

    useEffect(() => () => {
        stopDragging();
        stopResizing();
    }, [stopDragging, stopResizing]);

    const startDragging = (event) => {
        if (event.button !== 0 || event.target.closest('button') || webWindow.maximized || window.innerWidth <= 720) return;
        event.preventDefault();
        dragRef.current = { x: event.clientX, y: event.clientY, left: webWindow.left, top: webWindow.top };
        document.addEventListener('mousemove', moveWindow);
        document.addEventListener('mouseup', stopDragging);
    };

    const startResizing = (event, direction) => {
        if (event.button !== 0 || webWindow.maximized || window.innerWidth <= 720) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        resizeRef.current = { x: event.clientX, y: event.clientY, width: webWindow.width, height: webWindow.height, direction };
        document.addEventListener('pointermove', resizeWindow);
        document.addEventListener('pointerup', stopResizing);
    };

    return (
        <section
            className={`desktop-window ${webWindow.maximized ? 'is-maximized' : ''} ${webWindow.minimized ? 'is-minimized' : ''}`}
            style={{ left: webWindow.left, top: webWindow.top, width: webWindow.width, height: webWindow.height, zIndex: webWindow.zIndex }}
            onMouseDown={() => onFocus(webWindow.id)}
            aria-label={`${bookmark.title} 网页窗口`}
        >
            <header className="window-titlebar" onMouseDown={startDragging}>
                <div className="window-title"><SiteIcon item={bookmark} /><strong>{bookmark.title}</strong><span>本页打开</span></div>
                <div className="window-controls">
                    <button className="window-control desktop-window-control" type="button" onClick={() => onMinimize(webWindow.id)} aria-label="最小化"><RemoveRoundedIcon /></button>
                    <button className="window-control desktop-window-control" type="button" onClick={() => onToggleMaximize(webWindow.id)} aria-label="最大化或恢复"><CropSquareRoundedIcon /></button>
                    <button className="window-control close-control" type="button" onClick={() => onClose(webWindow.id)} aria-label="关闭"><CloseRoundedIcon /></button>
                </div>
            </header>
            {!webWindow.minimized && <div className="iframe-stage"><iframe data-window-id={webWindow.id} src={bookmark.url} title={bookmark.title} loading="lazy" onFocus={() => onFocus(webWindow.id)} onPointerDown={() => onFocus(webWindow.id)} /></div>}
            {!webWindow.minimized && <>
                <span className="window-resizer resizer-right" onPointerDown={(event) => startResizing(event, 'right')} aria-hidden="true" />
                <span className="window-resizer resizer-bottom" onPointerDown={(event) => startResizing(event, 'bottom')} aria-hidden="true" />
                <span className="window-resizer resizer-corner" onPointerDown={(event) => startResizing(event, 'right-bottom')} aria-hidden="true" />
            </>}
        </section>
    );
};

const BookmarkWorkspace = observer(() => {
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [webWindows, setWebWindows] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [collapsed, setCollapsed] = useState({});
    const nextZIndexRef = useRef(30);

    useEffect(() => {
        if (!RABookmarkList.isLoading && !RABookmarkList.allBookMarks.length) RABookmarkList.requestData();
    }, []);

    const entries = RABookmarkList.allBookMarks || [];
    const groups = useMemo(() => {
        const topSites = entries.filter((item) => item.type !== 'folder');
        const folders = entries.filter((item) => item.type === 'folder');
        return [
            ...(topSites.length ? [{ id: 'top-sites', title: '常用访问', items: topSites }] : []),
            ...folders.map((folder) => ({ id: folder.id, title: folder.title, items: folder.bookmarks || [], folder })),
        ];
    }, [entries]);

    const openItem = useCallback((bookmark) => {
        if (bookmark.type === 'folder') {
            setSelectedFolder(bookmark);
            return;
        }
        if (bookmark.iframe) {
            const width = Math.min(720, Math.max(320, window.innerWidth - 24));
            const height = Math.min(500, Math.max(230, window.innerHeight - 24));
            const nextZIndex = nextZIndexRef.current + 1;
            nextZIndexRef.current = nextZIndex;
            setWebWindows((windows) => [
                ...windows,
                { id: `${bookmark.id}-${Date.now()}`, bookmark, left: Math.max(12, Math.min(Math.round((window.innerWidth - width) / 2) + (windows.length % 4) * 28, window.innerWidth - width - 12)), top: Math.max(12, Math.min(Math.round((window.innerHeight - height) / 2) + (windows.length % 4) * 24, window.innerHeight - height - 12)), width, height, zIndex: nextZIndex, minimized: false, maximized: false },
            ]);
            setSelectedFolder(null);
        } else {
            window.open(bookmark.url, '_blank', 'noopener,noreferrer');
        }
    }, []);

    const focusWindow = useCallback((id) => {
        const nextZIndex = nextZIndexRef.current + 1;
        nextZIndexRef.current = nextZIndex;
        setWebWindows((windows) => windows.map((item) => item.id === id ? { ...item, zIndex: nextZIndex, minimized: false } : item));
    }, []);

    useEffect(() => {
        const focusActiveIframe = () => {
            const activeElement = document.activeElement;
            if (activeElement?.tagName === 'IFRAME' && activeElement.dataset.windowId) focusWindow(activeElement.dataset.windowId);
        };
        window.addEventListener('blur', focusActiveIframe);
        return () => window.removeEventListener('blur', focusActiveIframe);
    }, [focusWindow]);
    const closeWindow = (id) => setWebWindows((windows) => windows.filter((item) => item.id !== id));
    const minimizeWindow = (id) => setWebWindows((windows) => windows.map((item) => item.id === id ? { ...item, minimized: true } : item));
    const toggleMaximize = (id) => setWebWindows((windows) => windows.map((item) => item.id === id ? { ...item, maximized: !item.maximized, minimized: false } : item));
    const moveWindow = useCallback((id, position) => setWebWindows((windows) => windows.map((item) => item.id === id ? { ...item, ...position } : item)), []);
    const resizeWindow = useCallback((id, size) => setWebWindows((windows) => windows.map((item) => item.id === id ? { ...item, ...size } : item)), []);

    const visibleGroups = activeTab === 'all' ? groups : groups.filter((group) => String(group.id) === activeTab);

    return (
        <>
            <nav className="bookmark-tabs" aria-label="书签分类">
                <button type="button" className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}><AppsRoundedIcon /> 全部</button>
                {groups.map((group) => <button type="button" key={group.id} className={activeTab === String(group.id) ? 'active' : ''} onClick={() => setActiveTab(String(group.id))}><FolderRoundedIcon /> {group.title}</button>)}
            </nav>
            <div className="bookmark-groups">
                {RABookmarkList.isLoading && <div className="loading-state"><span className="loading-dot" />正在整理你的书签…</div>}
                {!RABookmarkList.isLoading && !groups.length && <div className="empty-state">还没有书签，先去配置你的导航数据吧。</div>}
                {!RABookmarkList.isLoading && activeTab === 'all' && groups.some((group) => group.folder) && <section className="folder-launcher-section">
                    <div className="folder-launcher-heading"><span><FolderRoundedIcon /> 文件夹</span><small>点击打开文件夹窗口</small></div>
                    <div className="folder-launcher-grid">{groups.filter((group) => group.folder).map((group) => <button key={group.id} className="folder-launcher" type="button" onClick={() => setSelectedFolder(group.folder)}><span className="folder-launcher-icon"><FolderRoundedIcon /></span><strong>{group.title}</strong><small>{group.items.length} 个书签</small></button>)}</div>
                </section>}
                {visibleGroups.map((group) => <BookmarkGroup key={group.id} group={group} onOpen={openItem} collapsed={Boolean(collapsed[group.id])} onToggle={() => setCollapsed((value) => ({ ...value, [group.id]: !value[group.id] }))} />)}
            </div>
            {createPortal(
                <>
                    <FolderSheet folder={selectedFolder} onClose={() => setSelectedFolder(null)} onOpen={openItem} />
                    <div className="desktop-windows" aria-live="polite">{webWindows.map((item) => <WebWindow key={item.id} webWindow={item} onFocus={focusWindow} onClose={closeWindow} onMinimize={minimizeWindow} onToggleMaximize={toggleMaximize} onMove={moveWindow} onResize={resizeWindow} />)}</div>
                    {webWindows.length > 0 && <nav className="window-dock" aria-label="网页窗口">
                        <div className="dock-label">打开的网页</div>
                        {webWindows.map((item) => <button type="button" key={item.id} className={item.minimized ? 'dock-item minimized' : 'dock-item'} onClick={() => focusWindow(item.id)}><SiteIcon item={item.bookmark} /><span>{item.bookmark.title}</span>{item.minimized && <i />}</button>)}
                        <button type="button" className="dock-close-all" onClick={() => setWebWindows([])} aria-label="关闭全部网页"><CloseRoundedIcon /></button>
                    </nav>}
                </>,
                document.body,
            )}
        </>
    );
});

export default BookmarkWorkspace;
