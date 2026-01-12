import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Camera, Link as LinkIcon, Upload, Loader2, ChefHat, Trash2, FileText, Zap } from 'lucide-react';
import { determineImage, determineProtein, getTier, compressImage } from '../utils';
import { Meal, Effort, Tier, SourceType } from '../types';
import { parseRecipeFromImage, generateRecipeFromText, editRecipeWithAI, generateThermomixMethod } from '../ai';
import { ToastType } from './Toast';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: Meal) => void;
  initialMeal?: Meal | null;
  onDelete?: (id: string) => void;
  onShowToast: (msg: string, type: ToastType) => void;
}

type Tab = 'quick' | 'magic';

const AddMealModal: React.FC<AddMealModalProps> = ({ isOpen, onClose, onSave, initialMeal, onDelete, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<Tab>('quick');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [useThermomix, setUseThermomix] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [effort, setEffort] = useState<Effort>('medium');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [method, setMethod] = useState('');
  const [thermomixMethod, setThermomixMethod] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [customImage, setCustomImage] = useState<string | null>(null);
  
  // Tags State
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // AI Edit State
  const [aiInstruction, setAiInstruction] = useState('');
  const [magicDescription, setMagicDescription] = useState('');
  
  // Source State
  const [sourceType, setSourceType] = useState<SourceType>('manual');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  
  // Tier Management
  const [selectedTier, setSelectedTier] = useState<Tier>('high');

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const scanFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && initialMeal) {
      setTitle(initialMeal.title);
      setEffort(initialMeal.effort);
      setDescription(initialMeal.description || '');
      setIngredients(initialMeal.ingredients?.join('\n') || '');
      setMethod(initialMeal.method?.join('\n') || '');
      setThermomixMethod(initialMeal.thermomixMethod?.join('\n') || '');
      setSourceUrl(initialMeal.sourceUrl || '');
      setCustomImage(initialMeal.image);
      setSourceType(initialMeal.sourceType || 'manual');
      setSourceImage(initialMeal.sourceImage || null);
      setTags(initialMeal.tags || []);
      setSelectedTier(getTier(initialMeal.lastCooked));
      setActiveTab('quick');
    } else if (isOpen && !initialMeal) {
      resetForm();
    }
  }, [isOpen, initialMeal]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setEffort('medium');
    setDescription('');
    setIngredients('');
    setMethod('');
    setThermomixMethod('');
    setSourceUrl('');
    setCustomImage(null);
    setSourceType('manual');
    setSourceImage(null);
    setTags([]);
    setTagInput('');
    setSelectedTier('high');
    setActiveTab('quick');
    setLoading(false);
    setUseThermomix(false);
    setAiInstruction('');
    setMagicDescription('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const newTag = tagInput.trim();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }
        setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let newLastCooked = Date.now();
    const DAY_MS = 86400000;

    if (initialMeal) {
        const currentTier = getTier(initialMeal.lastCooked);
        if (currentTier === selectedTier) {
            newLastCooked = initialMeal.lastCooked;
        } else {
            if (selectedTier === 'high') newLastCooked = Date.now();
            if (selectedTier === 'medium') newLastCooked = Date.now() - (21 * DAY_MS);
            if (selectedTier === 'low') newLastCooked = Date.now() - (70 * DAY_MS);
        }
    } else {
        if (selectedTier === 'medium') newLastCooked = Date.now() - (21 * DAY_MS);
        if (selectedTier === 'low') newLastCooked = Date.now() - (70 * DAY_MS);
    }

    const mealToSave: Meal = {
      id: initialMeal ? initialMeal.id : Date.now().toString(),
      title: title,
      lastCooked: newLastCooked,
      image: customImage || (initialMeal?.image || determineImage(title)),
      effort: effort,
      protein: determineProtein(title),
      keywords: title.toLowerCase().split(' '),
      description,
      ingredients: ingredients.split('\n').filter(l => l.trim()),
      method: method.split('\n').filter(l => l.trim()),
      thermomixMethod: thermomixMethod.split('\n').filter(l => l.trim()),
      sourceUrl,
      sourceType,
      sourceImage: undefined, // Do not store source image
      tags: tags
    };

    onSave(mealToSave);
    handleClose();
  };

  const validateFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      onShowToast("File too large. Max 5MB.", 'error');
      return false;
    }
    if (!file.type.startsWith('image/')) {
      onShowToast("Invalid file type. Please upload an image.", 'error');
      return false;
    }
    return true;
  };

  const handleMainPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) return;
    
    try {
        setLoading(true);
        setLoadingMessage('Compressing image...');
        const compressedBase64 = await compressImage(file, 800, 0.7);
        setCustomImage(compressedBase64);
        onShowToast("Image uploaded successfully", 'success');
    } catch (err) {
        onShowToast("Failed to process image.", 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleRecipeScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) return;

    try {
      setLoading(true);
      setLoadingMessage('Reading recipe and adapting steps...');
      const compressedBase64 = await compressImage(file, 1200, 0.7);
      const base64Data = compressedBase64.split(',')[1];
      // We process the image but do not store it to save space
      setSourceType('image'); 
      const aiData = await parseRecipeFromImage(base64Data, useThermomix);
      populateFromAI(aiData);
      onShowToast("Magic scan complete!", 'success');
    } catch (err) {
      onShowToast("Could not read recipe. Try a clearer photo.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlImport = async () => {
    if (!sourceUrl.trim()) return;
    setSourceType('url');
    setLoading(true);
    setLoadingMessage('Scraping and converting recipe...');
    try {
        const aiData = await generateRecipeFromText(sourceUrl, true, useThermomix);
        populateFromAI(aiData);
        onShowToast("Recipe imported!", 'success');
    } catch (err) {
        onShowToast("Could not find recipe details.", 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleGenerateFromTitle = async () => {
    if (!title.trim()) return;
    setSourceType('ai');
    setLoading(true);
    setLoadingMessage('AI is writing your robot-friendly recipe...');
    try {
        const aiData = await generateRecipeFromText(title, false, useThermomix, magicDescription);
        populateFromAI(aiData);
        onShowToast("Recipe created!", 'success');
    } catch (err) {
        onShowToast("Could not generate recipe.", 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleAIEdit = async () => {
    if (!aiInstruction.trim()) return;
    setLoading(true);
    setLoadingMessage('AI is updating your recipe...');
    try {
        const currentMeal: Partial<Meal> = {
            title, description, ingredients: ingredients.split('\n'), method: method.split('\n'), thermomixMethod: thermomixMethod.split('\n'), effort, protein: determineProtein(title)
        };
        const updated = await editRecipeWithAI(currentMeal, aiInstruction);
        populateFromAI(updated);
        setAiInstruction('');
        onShowToast("Recipe updated by AI!", 'success');
    } catch (err) {
        onShowToast("Failed to update recipe.", 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleGenerateThermomix = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setLoading(true);
    setLoadingMessage('Converting to Thermomix steps...');
    try {
        const currentMeal: Partial<Meal> = {
            title, ingredients: ingredients.split('\n'), method: method.split('\n')
        };
        const steps = await generateThermomixMethod(currentMeal);
        setThermomixMethod(steps.join('\n'));
        onShowToast("Thermomix steps generated!", 'success');
    } catch (err) {
        onShowToast("Failed to generate steps.", 'error');
    } finally {
        setLoading(false);
    }
  };

  const populateFromAI = (data: Partial<Meal>) => {
    if (data.title) setTitle(data.title);
    if (data.effort) setEffort(data.effort);
    if (data.description) setDescription(data.description);
    if (data.ingredients) setIngredients(data.ingredients.join('\n'));
    if (data.method) setMethod(data.method.join('\n'));
    if (data.thermomixMethod) setThermomixMethod(data.thermomixMethod.join('\n'));
    setActiveTab('quick');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={handleClose} />
      
      <div className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl flex flex-col max-h-[90vh] pointer-events-auto shadow-2xl transform transition-transform animate-in slide-in-from-bottom duration-300">
        
        <div className="flex-none p-6 pb-2 border-b border-gray-100 bg-white rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{initialMeal ? 'Edit Meal' : 'Add Meal'}</h2>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          
          <div className="flex space-x-4">
            <button 
                onClick={() => setActiveTab('quick')}
                className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'quick' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
                Meal Details
            </button>
            <button 
                onClick={() => setActiveTab('magic')}
                className={`pb-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1 ${activeTab === 'magic' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
                <Sparkles size={14} />
                Magic Import
            </button>
          </div>
        </div>

        {loading && (
             <div className="absolute inset-0 z-50 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm rounded-t-3xl sm:rounded-2xl">
                <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-3" />
                <p className="text-brand-900 font-medium animate-pulse">{loadingMessage}</p>
             </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
            
            {activeTab === 'magic' ? (
                <div className="space-y-6">
                     {/* Thermomix Mode Toggle */}
                     <div 
                        onClick={() => setUseThermomix(!useThermomix)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${useThermomix ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200 opacity-60'}`}
                     >
                        <div className={`p-2 rounded-lg ${useThermomix ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <Zap size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-bold text-sm ${useThermomix ? 'text-green-800' : 'text-gray-600'}`}>Robot Mode (Thermomix)</h3>
                            <p className="text-[10px] uppercase tracking-wider font-bold opacity-60">AI will adapt recipe for kitchen machines</p>
                        </div>
                        <div className={`w-10 h-6 rounded-full relative transition-colors ${useThermomix ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${useThermomix ? 'left-5' : 'left-1'}`} />
                        </div>
                     </div>

                     <div className="bg-brand-50 p-5 rounded-xl border border-brand-100">
                        <div className="flex items-center gap-2 mb-3 text-brand-900 font-bold">
                            <LinkIcon size={18} />
                            <span>Paste a Recipe Link</span>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="url" 
                                placeholder="https://..." 
                                value={sourceUrl}
                                onChange={(e) => setSourceUrl(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <button 
                                onClick={handleUrlImport}
                                disabled={!sourceUrl}
                                className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
                            >
                                Import
                            </button>
                        </div>
                     </div>

                     <div className="flex items-center gap-4">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-gray-400 text-sm font-medium">OR</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                     </div>

                     <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold">
                            <Camera size={18} />
                            <span>Scan Recipe Book</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">Take a photo of a cookbook page. We'll extract text and adapt steps.</p>
                        <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded mb-4 font-medium">Note: Images are processed to extract text but not stored. Please keep a copy of the original.</p>
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={scanFileInputRef}
                            onChange={handleRecipeScan}
                            className="hidden" 
                        />
                        <button 
                            onClick={() => scanFileInputRef.current?.click()}
                            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            <Upload size={18} />
                            Scan & Adapt
                        </button>
                     </div>

                     <div className="flex items-center gap-4">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-gray-400 text-sm font-medium">OR</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                     </div>

                     <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold">
                            <ChefHat size={18} />
                            <span>Generate from Title</span>
                        </div>
                        <div className="space-y-3">
                            <input 
                                type="text" 
                                placeholder="e.g. Grandma's Apple Pie" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <textarea 
                                placeholder="Optional details (e.g. gluten free, extra spicy, serves 4...)"
                                value={magicDescription}
                                onChange={(e) => setMagicDescription(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm h-20 resize-none"
                            />
                            <button 
                                onClick={handleGenerateFromTitle}
                                disabled={!title}
                                className="w-full bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                            >
                                Create Recipe
                            </button>
                        </div>
                     </div>
                </div>
            ) : (
                <form id="mealForm" onSubmit={handleSubmit} className="space-y-5">
                    {/* AI Edit Section */}
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6">
                        <label className="block text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-600"/>
                            Edit with AI
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g. Make it vegan, double ingredients..."
                                value={aiInstruction}
                                onChange={(e) => setAiInstruction(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-purple-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAIEdit(); } }}
                            />
                            <button
                                type="button"
                                onClick={handleAIEdit}
                                disabled={!aiInstruction.trim()}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-lg px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Status (Rotation Tier)</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['high', 'medium', 'low'] as Tier[]).map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setSelectedTier(t)}
                                    className={`p-2 rounded-lg text-xs sm:text-sm font-medium border transition-all ${selectedTier === t ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                >
                                    {t === 'high' ? 'Heavy Hitter' : t === 'medium' ? 'The Bench' : 'The Archive'}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Presentation Photo</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative flex items-center justify-center">
                                {customImage || (title && determineImage(title)) ? (
                                    <img src={customImage || determineImage(title)} className="w-full h-full object-cover" />
                                ) : (
                                    <Camera size={24} className="text-gray-300" />
                                )}
                            </div>
                            <button 
                                type="button"
                                onClick={() => mainFileInputRef.current?.click()}
                                className="text-sm font-medium text-brand-600 hover:text-brand-800 flex items-center gap-1"
                            >
                                <Upload size={14} /> Change Main Photo
                            </button>
                            <input type="file" accept="image/*" ref={mainFileInputRef} onChange={handleMainPhotoUpload} className="hidden" />
                        </div>
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                         <textarea 
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm text-gray-900"
                            rows={4}
                         />
                    </div>

                    <div className="space-y-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Standard Method</label>
                             <textarea 
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm text-gray-900"
                                rows={4}
                             />
                        </div>
                        <div>
                             <div className="flex justify-between items-end mb-1">
                                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Zap size={14} className="text-green-600" />
                                    Thermomix Method (Optional)
                                </label>
                                <button
                                    type="button"
                                    onClick={handleGenerateThermomix}
                                    className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 hover:bg-green-100 flex items-center gap-1 transition-colors"
                                >
                                    <Sparkles size={10} /> Generate with AI
                                </button>
                             </div>
                             <textarea 
                                value={thermomixMethod}
                                onChange={(e) => setThermomixMethod(e.target.value)}
                                className="w-full px-3 py-2 bg-green-50/30 border border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm text-gray-900"
                                rows={4}
                                placeholder="AI generated Thermomix steps..."
                             />
                        </div>
                    </div>
                </form>
            )}
        </div>

        <div className="flex-none p-6 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl sm:rounded-b-2xl flex gap-3">
          {activeTab === 'quick' ? (
             <>
                 {initialMeal && onDelete && (
                    <button
                        type="button"
                        onClick={() => { if(window.confirm('Delete this meal?')) { onDelete(initialMeal.id); handleClose(); } }}
                        className="bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-100"
                    >
                        <Trash2 size={24} />
                    </button>
                 )}
                 <button type="submit" form="mealForm" disabled={!title.trim()} className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-lg disabled:opacity-50">
                    {initialMeal ? 'Update' : 'Save'}
                </button>
             </>
          ) : (
            <p className="w-full text-center text-xs text-gray-400">Select Thermomix mode above if required before importing.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMealModal;
