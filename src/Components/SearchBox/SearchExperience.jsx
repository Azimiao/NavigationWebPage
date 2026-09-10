import React, { useEffect, useRef, useState } from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import RASearchEngines from './RASearchEngines';

const SearchExperience = () => {
    const inputRef = useRef(null);
    const [engineIndex, setEngineIndex] = useState(() => Number(localStorage.getItem('RASearchEngineIndex') || 0));
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showEngines, setShowEngines] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const engine = RASearchEngines[engineIndex] || RASearchEngines[0];

    const handleEnginePickerBlur = (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setShowEngines(false);
    };

    useEffect(() => localStorage.setItem('RASearchEngineIndex', engineIndex), [engineIndex]);

    useEffect(() => {
        let cancelled = false;
        if (!query.trim()) {
            setSuggestions([]);
            return undefined;
        }
        const timer = window.setTimeout(() => {
            engine.suggester(query.trim()).then((items) => {
                if (!cancelled) setSuggestions(Array.isArray(items) ? items.slice(0, 6) : []);
            }).catch(() => !cancelled && setSuggestions([]));
        }, 180);
        return () => { cancelled = true; window.clearTimeout(timer); };
    }, [query, engine]);

    const submit = (value = query) => {
        const cleanValue = value.trim();
        if (!cleanValue) return;
        window.open(engine.searcher(cleanValue), '_blank', 'noopener,noreferrer');
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const chooseEngine = (index) => {
        setEngineIndex(index);
        setShowEngines(false);
        inputRef.current?.focus();
    };

    return (
        <div className="search-experience">
            <form className="search-bar" onSubmit={(event) => { event.preventDefault(); submit(); }}>
                <div className="engine-picker" onBlur={handleEnginePickerBlur}>
                    <button className="engine-trigger" type="button" onClick={() => setShowEngines((value) => !value)} aria-label="切换搜索引擎">
                        {engine.icon ? <img src={engine.icon} alt="" /> : <span>{engine.name.slice(0, 1)}</span>}
                        <KeyboardArrowDownRoundedIcon />
                    </button>
                    {showEngines && (
                        <div className="engine-menu">
                            {RASearchEngines.map((item, index) => (
                                <button key={item.name} type="button" className={index === engineIndex ? 'selected' : ''} onClick={() => chooseEngine(index)} aria-label={item.name} title={item.name}>
                                    {item.icon ? <img src={item.icon} alt="" /> : <span className="engine-letter">{item.name.slice(0, 1)}</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <span className="search-divider" />
                <SearchRoundedIcon className="search-leading-icon" />
                <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => { setQuery(event.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setShowSuggestions(false)}
                    onKeyDown={(event) => {
                        if (event.key === 'Tab') { event.preventDefault(); chooseEngine((engineIndex + 1) % RASearchEngines.length); }
                    }}
                    placeholder={engine.placeholder || `使用${engine.name}搜索`}
                    aria-label="搜索互联网"
                />
                <button className="search-submit" type="submit" aria-label="开始搜索"><SearchRoundedIcon /></button>
                </form>
            {showSuggestions && query.trim() && suggestions.length > 0 && (
                <div className="search-suggestions" role="listbox">
                    {suggestions.map((suggestion) => (
                        <button key={suggestion} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => submit(suggestion)}>
                            <SearchRoundedIcon /> <span>{suggestion}</span>
                        </button>
                    ))}
                </div>
            )}
            <div className="search-shortcuts"><span>搜索互联网</span><span>Tab 切换引擎</span><span>Enter 开始搜索</span></div>
        </div>
    );
};

export default SearchExperience;
