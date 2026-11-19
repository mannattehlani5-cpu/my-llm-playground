'use client';

import React, { useState } from 'react';
import { GenerationSettings } from '../lib/types';
import { AVAILABLE_MODELS, DEFAULT_SETTINGS } from '../lib/models';
import { SYSTEM_PROMPT_PRESETS } from '../lib/presets';
import { SlidersIcon, CloseIcon, RefreshIcon } from './Icons';

interface SettingsDrawerProps {
  settings: GenerationSettings;
  onChange: (settings: GenerationSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDrawer({
  settings,
  onChange,
  isOpen,
  onClose,
}: SettingsDrawerProps) {
  const [isCustomModel, setIsCustomModel] = useState(
    !AVAILABLE_MODELS.some(m => m.id === settings.model)
  );

  const currentModel = AVAILABLE_MODELS.find(m => m.id === settings.model);

  const updateSetting = <K extends keyof GenerationSettings>(
    key: K,
    val: GenerationSettings[K]
  ) => {
    onChange({
      ...settings,
      [key]: val,
    });
  };

  const handleResetDefaults = () => {
    onChange({ ...DEFAULT_SETTINGS });
    setIsCustomModel(false);
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = SYSTEM_PROMPT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      updateSetting('systemPrompt', preset.prompt);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-30 xl:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Drawer Container */}
      <aside
        className={`fixed xl:static top-0 bottom-0 right-0 z-40 w-84 bg-zinc-950 border-l border-zinc-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full xl:hidden'
        }`}
      >
        {/* Header */}
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersIcon size={16} className="text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Model & Parameters
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleResetDefaults}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors text-xs flex items-center gap-1"
              title="Reset parameters to default"
            >
              <RefreshIcon size={12} />
              <span className="text-[10px]">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Close drawer"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable controls */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
          {/* Section: Model Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-200">Model</label>
              <button
                onClick={() => setIsCustomModel(!isCustomModel)}
                className="text-[10px] text-blue-400 hover:text-blue-300 underline"
              >
                {isCustomModel ? 'Choose preset' : 'Custom model ID'}
              </button>
            </div>

            {isCustomModel ? (
              <input
                type="text"
                value={settings.model}
                onChange={e => updateSetting('model', e.target.value)}
                placeholder="e.g. gpt-4o, claude-3-5-sonnet, deepseek-chat"
                className="w-full px-2.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <select
                value={settings.model}
                onChange={e => updateSetting('model', e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:border-blue-500 focus:outline-none"
              >
                <optgroup label="OpenAI">
                  {AVAILABLE_MODELS.filter(m => m.provider === 'openai').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.contextWindow})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Anthropic">
                  {AVAILABLE_MODELS.filter(m => m.provider === 'anthropic').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.contextWindow})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Google Gemini">
                  {AVAILABLE_MODELS.filter(m => m.provider === 'google').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.contextWindow})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Groq / Open Source">
                  {AVAILABLE_MODELS.filter(m => m.provider === 'groq').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.contextWindow})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="DeepSeek">
                  {AVAILABLE_MODELS.filter(m => m.provider === 'deepseek').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.contextWindow})
                    </option>
                  ))}
                </optgroup>
              </select>
            )}

            {/* Model info card */}
            {currentModel && (
              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1.5 text-zinc-400">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-zinc-300">
                    {currentModel.providerName}
                  </span>
                  {currentModel.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                      {currentModel.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  {currentModel.description}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/50">
                  <span>Context: <strong className="text-zinc-300">{currentModel.contextWindow}</strong></span>
                  <span>Max Out: <strong className="text-zinc-300">{currentModel.maxOutput}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Section: System Prompt Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-200">System Prompt</label>
              <span className="text-[10px] text-zinc-500 font-mono">
                {settings.systemPrompt.length} chars
              </span>
            </div>

            {/* Preset chips */}
            <div className="flex flex-wrap gap-1">
              {SYSTEM_PROMPT_PRESETS.slice(0, 4).map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <textarea
              value={settings.systemPrompt}
              onChange={e => updateSetting('systemPrompt', e.target.value)}
              rows={4}
              placeholder="Define instructions, personality, and format constraints..."
              className="w-full px-2.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:border-blue-500 focus:outline-none resize-y leading-relaxed font-sans"
            />
          </div>

          {/* Section: Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-semibold text-zinc-200">Temperature</label>
                <span className="block text-[10px] text-zinc-500">
                  {settings.temperature < 0.3
                    ? 'Deterministic & Precise'
                    : settings.temperature > 1.1
                    ? 'Highly Creative & Varied'
                    : 'Balanced & Standard'}
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="2"
                step="0.05"
                value={settings.temperature}
                onChange={e => updateSetting('temperature', parseFloat(e.target.value) || 0)}
                className="w-14 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-center font-mono text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={settings.temperature}
              onChange={e => updateSetting('temperature', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
              <span>0.0 (Precise)</span>
              <span>1.0</span>
              <span>2.0 (Creative)</span>
            </div>
          </div>

          {/* Section: Max Tokens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-semibold text-zinc-200">Max Tokens</label>
                <span className="block text-[10px] text-zinc-500">
                  Response length ceiling
                </span>
              </div>
              <input
                type="number"
                min="64"
                max="16384"
                step="64"
                value={settings.maxTokens}
                onChange={e => updateSetting('maxTokens', parseInt(e.target.value, 10) || 64)}
                className="w-18 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-center font-mono text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <input
              type="range"
              min="64"
              max="8192"
              step="64"
              value={Math.min(settings.maxTokens, 8192)}
              onChange={e => updateSetting('maxTokens', parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
            {/* Quick token preset buttons */}
            <div className="flex gap-1 pt-1">
              {[512, 1024, 2048, 4096].map(tok => (
                <button
                  key={tok}
                  onClick={() => updateSetting('maxTokens', tok)}
                  className={`flex-1 py-1 rounded text-[10px] font-mono border transition-colors ${
                    settings.maxTokens === tok
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tok}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Top-P */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-semibold text-zinc-200">Top-P (Nucleus Sampling)</label>
                <span className="block text-[10px] text-zinc-500">
                  Cumulative probability mass
                </span>
              </div>
              <input
                type="number"
                min="0.05"
                max="1"
                step="0.05"
                value={settings.topP}
                onChange={e => updateSetting('topP', parseFloat(e.target.value) || 1)}
                className="w-14 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-center font-mono text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={settings.topP}
              onChange={e => updateSetting('topP', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </aside>
    </>
  );
}
