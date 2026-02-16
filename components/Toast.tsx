import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-secondary-50 dark:bg-secondary-950/50 border-secondary-200 dark:border-secondary-800 text-secondary-800 dark:text-secondary-200',
    error: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    info: 'bg-primary-50 dark:bg-primary-950/50 border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-200'
  };

  const icons = {
    success: <CheckCircle size={18} className="text-secondary-500" />,
    error: <AlertCircle size={18} className="text-red-500" />,
    info: <AlertCircle size={18} className="text-primary-500" />
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -50, x: '-50%' }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`
        fixed top-4 left-1/2 z-[100]
        flex items-center gap-3 p-4 rounded-xl shadow-lg border
        w-[calc(100%-2rem)] max-w-md
        ${styles[type]}
      `}
    >
      <div className="flex-none">{icons[type]}</div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose} 
        className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
      >
        <X size={14} />
      </motion.button>
    </motion.div>
  );
};

export default Toast;