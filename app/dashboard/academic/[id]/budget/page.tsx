'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Plus, DollarSign, PieChart, TrendingUp, Trash2, ShoppingBag, Coffee, Car, Home, Check } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Expense = {
  id: string
  description: string
  amount: number
  category: string
  expense_date: string
}

const CATEGORIES = [
  { name: 'Food', icon: <Coffee size={18} />, color: 'bg-orange-100 text-orange-500' },
  { name: 'Transport', icon: <Car size={18} />, color: 'bg-blue-100 text-blue-500' },
  { name: 'Stay', icon: <Home size={18} />, color: 'bg-purple-100 text-purple-500' },
  { name: 'Shopping', icon: <ShoppingBag size={18} />, color: 'bg-pink-100 text-pink-500' },
  { name: 'Other', icon: <DollarSign size={18} />, color: 'bg-gray-100 text-gray-500' },
]

export default function BudgetTracker() {
  const params = useParams()
  const id = params?.id as string
  const supabase = createClient()

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgetLimit, setBudgetLimit] = useState(0)
  
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')

  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'limit' | null;
    targetId?: string;
    inputValue?: string;
  }>({ isOpen: false, type: null, inputValue: '' })

  const fetchData = async () => {
    const { data: trip } = await supabase
      .from('itineraries')
      .select('budget_limit')
      .eq('id', id)
      .single()
    
    if (trip) setBudgetLimit(trip.budget_limit || 0)

    const { data: exp } = await supabase
      .from('itinerary_expenses')
      .select('*')
      .eq('itinerary_id', id)
      .order('expense_date', { ascending: false })

    if (exp) setExpenses(exp)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!desc || !amount) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('itinerary_expenses')
      .insert([{
        itinerary_id: id,
        user_id: user.id,
        description: desc,
        amount: parseFloat(amount),
        category: category
      }])

    if (!error) {
      setDesc('')
      setAmount('')
      fetchData()
    }
  }

  const confirmDelete = (expId: string) => {
    setModal({ isOpen: true, type: 'delete', targetId: expId })
  }

  const openLimitModal = () => {
    setModal({ isOpen: true, type: 'limit', inputValue: budgetLimit.toString() })
  }

  const handleModalConfirm = async () => {
    if (modal.type === 'delete' && modal.targetId) {
      await supabase.from('itinerary_expenses').delete().eq('id', modal.targetId)
      fetchData()
    }
    
    if (modal.type === 'limit' && modal.inputValue) {
      await supabase
        .from('itineraries')
        .update({ budget_limit: parseFloat(modal.inputValue) })
        .eq('id', id)
      fetchData()
    }

    setModal({ isOpen: false, type: null })
  }

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0)
  const remaining = budgetLimit - totalSpent
  const percentUsed = budgetLimit > 0 ? (totalSpent / budgetLimit) * 100 : 0

  // --- TRAFFIC LIGHT COLOR LOGIC ---
  const getProgressColor = () => {
    if (percentUsed >= 100) return 'bg-red-500' // Over Budget
    if (percentUsed >= 85) return 'bg-red-400'  // Danger Zone
    if (percentUsed >= 50) return 'bg-yellow-400' // Caution
    return 'bg-green-400' // Safe
  }
  
  // --- NEW: COZY REMINDERS LOGIC ---
  const getProgressMessage = () => {
    if (percentUsed >= 100) return "Oh no! Budget exceeded 🛑"
    if (percentUsed >= 85) return "Careful, funds are getting low 🍂"
    if (percentUsed >= 50) return "Start paying attention... ☁️"
    return "You are doing great! 🌸"
  }
  
  // Helper for text color to match the bar
  const getTextColor = () => {
    if (percentUsed >= 100) return 'text-red-500'
    if (percentUsed >= 85) return 'text-red-400'
    if (percentUsed >= 50) return 'text-yellow-600'
    return 'text-green-500'
  }
  // ---------------------------------

  return (
    <div className="max-w-5xl mx-auto space-y-8 relative">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/academic/${id}`} className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-cozy-sage" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-cozy-text">Cozy Wallet</h1>
          <p className="text-cozy-sage text-sm">Keep track of your spending.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Budget */}
        <div onClick={openLimitModal} className="bg-white p-6 rounded-3xl shadow-soft border-b-4 border-blue-200 cursor-pointer hover:bg-gray-50 transition-colors group">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 text-blue-500 rounded-xl"><PieChart size={20} /></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Total Budget</span>
          </div>
          <div className="text-2xl font-bold text-cozy-text">₱{budgetLimit.toLocaleString()}</div>
          <div className="text-xs text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Tap to edit limit</div>
        </div>

        {/* Spent */}
        <div className="bg-white p-6 rounded-3xl shadow-soft border-b-4 border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-100 text-orange-500 rounded-xl"><TrendingUp size={20} /></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Total Spent</span>
          </div>
          <div className="text-2xl font-bold text-cozy-text">₱{totalSpent.toLocaleString()}</div>
        </div>

        {/* Remaining */}
        <div className="bg-white p-6 rounded-3xl shadow-soft border-b-4 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 text-green-500 rounded-xl"><DollarSign size={20} /></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Remaining</span>
          </div>
          <div className={`text-2xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-cozy-text'}`}>
            ₱{remaining.toLocaleString()}
          </div>
        </div>
      </div>

      {/* --- DYNAMIC PROGRESS SECTION --- */}
      <div className="space-y-2">
        <div className="bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            className={`h-full transition-all duration-700 ease-in-out ${getProgressColor()}`} 
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          ></div>
        </div>
        {/* The Soft Reminder Text */}
        <p className={`text-xs font-bold text-right transition-colors duration-500 ${getTextColor()}`}>
          {getProgressMessage()}
        </p>
      </div>
      {/* -------------------------------- */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Add Expense Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-soft border border-cozy-cream sticky top-8">
            <h3 className="font-bold text-cozy-text mb-6">Add New Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                <input 
                  type="text" placeholder="e.g. Lunch at Cafe" required
                  className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-cozy-pink outline-none"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Amount (₱)</label>
                <input 
                  type="number" step="0.01" required
                  className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-cozy-pink outline-none"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all ${
                        category === cat.name 
                        ? 'bg-cozy-text text-white shadow-md transform scale-105' 
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-cozy-pink text-white font-bold py-3 rounded-xl hover:bg-pink-300 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer">
                <Plus size={18} /> Add Expense
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Expense List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-cozy-text ml-2">Recent Transactions</h3>
          
          {expenses.length === 0 ? (
            <div className="text-center py-10 text-gray-300 border-2 border-dashed border-gray-200 rounded-3xl">
              No expenses yet. Start spending! 💸
            </div>
          ) : (
            expenses.map(exp => {
              const catConfig = CATEGORIES.find(c => c.name === exp.category) || CATEGORIES[4]
              return (
                <div key={exp.id} className="bg-white p-4 rounded-2xl shadow-sm border border-transparent hover:border-cozy-pink/30 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${catConfig.color}`}>
                      {catConfig.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-cozy-text">{exp.description}</h4>
                      <p className="text-xs text-gray-400">{new Date(exp.expense_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-cozy-text">-₱{exp.amount.toFixed(2)}</span>
                    <button 
                      onClick={() => confirmDelete(exp.id)} 
                      className="text-gray-200 hover:text-red-400 transition-colors p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* --- MODAL --- */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          
          <div 
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-all"
            onClick={() => setModal({ ...modal, isOpen: false })}
          ></div>

          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 relative z-10 border-4 border-white ring-4 ring-cozy-pink/20 animate-in zoom-in-95 duration-200">
            
            <div className="text-center mb-6">
              {modal.type === 'delete' ? (
                <>
                  <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-cozy-text">Remove Expense?</h3>
                  <p className="text-gray-400 text-sm mt-2">This will disappear from your wallet forever!</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PieChart size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-cozy-text">Update Budget</h3>
                  <p className="text-gray-400 text-sm mt-2">Set a new limit for this trip.</p>
                  
                  <div className="mt-4 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₱</span>
                    <input 
                      type="number"
                      autoFocus
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-200 rounded-xl py-3 pl-8 pr-4 font-bold text-cozy-text outline-none text-center text-lg"
                      value={modal.inputValue}
                      onChange={(e) => setModal({ ...modal, inputValue: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setModal({ ...modal, isOpen: false })}
                className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleModalConfirm}
                className={`flex-1 py-3 rounded-xl font-bold text-white shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 ${
                  modal.type === 'delete' ? 'bg-red-400 hover:bg-red-500' : 'bg-blue-400 hover:bg-blue-500'
                }`}
              >
                {modal.type === 'delete' ? 'Yes, Delete' : 'Save Limit'}
                {modal.type === 'limit' && <Check size={18} />}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}