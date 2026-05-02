import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Camera, Link as LinkIcon, Upload, Loader2, ChefHat, Trash2, Zap } from 'lucide-react';
import { determineImage, determineProtein, getMealTier, TIER_CONFIG, compressImage } from '../utils';
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
  const [selectedTier, setSelectedTier] = useState<Tier>('regulars');

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
      setSelectedTier(getMealTier(initialMeal));
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
    setSelectedTier('regulars');
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

    const mealToSave: Meal = {
      id: initialMeal ? initialMeal.id : Date.now().toString(),
      title: title,
      tier: selectedTier,
      lastCooked: initialMeal?.lastCooked || Date.now(),
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
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        <motion.div 
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl bg-surface rounded-t-3xl sm:rounded-2xl flex flex-col max-h-[90vh] shadow-2xl relative z-10"
        >
          
          <div className="flex-none p-6 pb-2 border-b border-border bg-surface rounded-t-3xl sm:rounded-t-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-display font-bold text-primary">{initialMeal ? 'Edit Meal' : 'Add Meal'}</h2>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose} 
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
              >
                <X className="w-6 h-6 text-secondary" />
              </motion.button>
            </div>
            
            <div className="flex space-x-4">
              <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('quick')}
                  className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'quick' ? 'border-primary-600 text-primary-600' : 'border-transparent text-secondary hover:text-primary'}`}
              >
                  Meal Details
              </motion.button>
              <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('magic')}
                  className={`pb-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1 ${activeTab === 'magic' ? 'border-primary-500 text-primary-600' : 'border-transparent text-secondary hover:text-primary'}`}
              >
                  <Sparkles size={14} />
                  Magic Import
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-surface/80 flex flex-col items-center justify-center backdrop-blur-sm rounded-t-3xl sm:rounded-2xl"
              >
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
                <p className="text-primary font-medium animate-pulse">{loadingMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              
              {activeTab === 'magic' ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                     {/* Thermomix Mode Toggle */}
                     <motion.div 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setUseThermomix(!useThermomix)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${useThermomix ? 'bg-secondary-50 dark:bg-secondary-950/50 border-secondary-500' : 'bg-neutral-50 dark:bg-neutral-900 border-border opacity-60'}`}
                     >
                        <div className={`p-2 rounded-lg ${useThermomix ? 'bg-secondary-500 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-secondary'}`}>
                            <Zap size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-bold text-sm ${useThermomix ? 'text-secondary-800 dark:text-secondary-200' : 'text-secondary'}`}>Robot Mode (Thermomix)</h3>
                            <p className="text-[10px] uppercase tracking-wider font-bold opacity-60">AI will adapt recipe for kitchen machines</p>
                        </div>
                        <div className={`w-10 h-6 rounded-full relative transition-colors ${useThermomix ? 'bg-secondary-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${useThermomix ? 'left-5' : 'left-1'}`} />
                        </div>
                     </motion.div>

                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.1 }}
                       className="bg-primary-50 dark:bg-primary-950/50 p-5 rounded-xl border border-primary-200 dark:border-primary-800"
                     >
                        <div className="flex items-center gap-2 mb-3 text-primary-900 dark:text-primary-100 font-bold">
                            <LinkIcon size={18} />
                            <span>Paste a Recipe Link</span>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="url" 
                                placeholder="https://..." 
                                value={sourceUrl}
                                onChange={(e) => setSourceUrl(e.target.value)}
                                className="input flex-1"
                            />
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleUrlImport}
                                disabled={!sourceUrl}
                                className="btn-primary"
                            >
                                Import
                            </motion.button>
                        </div>
                     </motion.div>

                     <div className="flex items-center gap-4">
                        <div className="h-px bg-border flex-1"></div>
                        <span className="text-secondary text-sm font-medium">OR</span>
                        <div className="h-px bg-border flex-1"></div>
                     </div>

                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.2 }}
                       className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-xl border border-border"
                     >
                        <div className="flex items-center gap-2 mb-3 text-primary font-bold">
                            <Camera size={18} />
                            <span>Scan Recipe Book</span>
                        </div>
                        <p className="text-sm text-secondary mb-2">Take a photo of a cookbook page. We'll extract text and adapt steps.</p>
                        <p className="text-xs text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/50 p-2 rounded mb-4 font-medium">Note: Images are processed to extract text but not stored. Please keep a copy of the original.</p>
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={scanFileInputRef}
                            onChange={handleRecipeScan}
                            className="hidden" 
                        />
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => scanFileInputRef.current?.click()}
                            className="w-full bg-surface border border-border text-primary py-3 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Upload size={18} />
                            Scan & Adapt
                        </motion.button>
                     </motion.div>

                     <div className="flex items-center gap-4">
                        <div className="h-px bg-border flex-1"></div>
                        <span className="text-secondary text-sm font-medium">OR</span>
                        <div className="h-px bg-border flex-1"></div>
                     </div>

                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.3 }}
                       className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-xl border border-border"
                     >
                        <div className="flex items-center gap-2 mb-3 text-primary font-bold">
                            <ChefHat size={18} />
                            <span>Generate from Title</span>
                        </div>
                        <div className="space-y-3">
                            <input 
                                type="text" 
                                placeholder="e.g. Grandma's Apple Pie" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="input"
                            />
                            <textarea 
                                placeholder="Optional details (e.g. gluten free, extra spicy, serves 4...)"
                                value={magicDescription}
                                onChange={(e) => setMagicDescription(e.target.value)}
                                className="input text-sm h-20 resize-none"
                            />
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleGenerateFromTitle}
                                disabled={!title}
                                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                            >
                                Create Recipe
                            </motion.button>
                        </div>
                     </motion.div>
                </motion.div>
              ) : (
                <motion.form 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  id="mealForm" 
                  onSubmit={handleSubmit} 
                  className="space-y-5"
                >
                    {/* AI Edit Section */}
                    <div className="bg-purple-50 dark:bg-purple-950/50 p-4 rounded-xl border border-purple-200 dark:border-purple-800 mb-6">
                        <label className="block text-sm font-bold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-600"/>
                            Edit with AI
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g. Make it vegan, double ingredients..."
                                value={aiInstruction}
                                onChange={(e) => setAiInstruction(e.target.value)}
                                className="input flex-1 text-sm"
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAIEdit(); } }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={handleAIEdit}
                                disabled={!aiInstruction.trim()}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                            >
                                Apply
                            </motion.button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input text-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary mb-2">Category</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['favorites', 'regulars', 'occasional'] as Tier[]).map(t => (
                                <motion.button
                                    key={t}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={() => setSelectedTier(t)}
                                    className={`p-2 rounded-lg text-xs sm:text-sm font-medium border transition-all ${selectedTier === t ? 'bg-primary-600 text-white border-primary-600' : 'bg-surface text-secondary border-border hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
                                >
                                    {TIER_CONFIG[t].label}
                                </motion.button>
                            ))}
                        </div>
                        <p className="text-xs text-secondary mt-2">
                            {TIER_CONFIG[selectedTier].description}
                        </p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-primary mb-1">Presentation Photo</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-border relative flex items-center justify-center">
                                {customImage || (title && determineImage(title)) ? (
                                    <img src={customImage || determineImage(title)} className="w-full h-full object-cover" alt="Meal" />
                                ) : (
                                    <Camera size={24} className="text-secondary" />
                                )}
                            </div>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => mainFileInputRef.current?.click()}
                                className="text-sm font-medium text-primary-600 hover:text-primary-800 dark:hover:text-primary-400 flex items-center gap-1"
                            >
                                <Upload size={14} /> Change Main Photo
                            </motion.button>
                            <input type="file" accept="image/*" ref={mainFileInputRef} onChange={handleMainPhotoUpload} className="hidden" />
                        </div>
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-primary mb-1">Ingredients</label>
                         <textarea 
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                            className="input"
                            rows={4}
                         />
                    </div>

                    <div className="space-y-4">
                        <div>
                             <label className="block text-sm font-medium text-primary mb-1">Standard Method</label>
                             <textarea 
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="input"
                                rows={4}
                             />
                        </div>
                        <div>
                             <div className="flex justify-between items-end mb-1">
                                <label className="block text-sm font-medium text-primary flex items-center gap-2">
                                    <Zap size={14} className="text-secondary-600" />
                                    Thermomix Method (Optional)
                                </label>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={handleGenerateThermomix}
                                    className="text-xs bg-secondary-50 dark:bg-secondary-950/50 text-secondary-700 dark:text-secondary-300 px-2 py-1 rounded border border-secondary-200 dark:border-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-900/50 flex items-center gap-1 transition-colors"
                                >
                                    <Sparkles size={10} /> Generate with AI
                                </motion.button>
                             </div>
                             <textarea 
                                value={thermomixMethod}
                                onChange={(e) => setThermomixMethod(e.target.value)}
                                className="input bg-secondary-50/30 dark:bg-secondary-950/30 border-secondary-200 dark:border-secondary-800 focus:ring-secondary-500 focus:border-secondary-500"
                                rows={4}
                                placeholder="AI generated Thermomix steps..."
                             />
                        </div>
                    </div>
                </motion.form>
              )}
          </div>

          <div className="flex-none p-6 pt-4 border-t border-border bg-neutral-50 dark:bg-neutral-900 rounded-b-3xl sm:rounded-b-2xl flex gap-3">
            {activeTab === 'quick' ? (
               <>
                  {initialMeal && onDelete && (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => { if(window.confirm('Delete this meal?')) { onDelete(initialMeal.id); handleClose(); } }}
                        className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 p-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50"
                    >
                        <Trash2 size={24} />
                    </motion.button>
                  )}
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    form="mealForm" 
                    disabled={!title.trim()} 
                    className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-primary-700 transition-colors"
                  >
                    {initialMeal ? 'Update' : 'Save'}
                  </motion.button>
               </>
            ) : (
              <p className="w-full text-center text-xs text-secondary">Select Thermomix mode above if required before importing.</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddMealModal;
