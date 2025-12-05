import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  StatusBar,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
}

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [dateInput, setDateInput] = useState(formatDateInput(new Date()));
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditingExpense, setIsEditingExpense] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [showEditCalendar, setShowEditCalendar] = useState(false);

  // Color scheme
  const colors = isDarkMode ? {
    bg: '#1C1C1E',
    bgSecondary: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#A1A1A6',
    border: '#3A3A3C',
    input: '#3A3A3C',
    inputText: '#FFFFFF',
  } : {
    bg: '#FFFFFF',
    bgSecondary: '#F5F5F7',
    text: '#000000',
    textSecondary: '#86868B',
    border: '#E5E5E7',
    input: '#FFFFFF',
    inputText: '#000000',
  };

  function formatDateInput(date: Date): string {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function parseDate(dateStr: string): Date | null {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
      return null;
    }

    const date = new Date(year, month - 1, day);
    return date.getDate() === day ? date : null;
  }

  const formatDateLong = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const addExpense = () => {
    if (!description.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please enter expense and amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: description.trim(),
      amount: numAmount,
      date: selectedDate,
    };

    setExpenses([newExpense, ...expenses]);
    setDescription('');
    setAmount('');
    setSelectedDate(new Date());
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const updateExpenseDate = (expenseId: string, dateStr: string) => {
    const newDate = parseDate(dateStr);
    if (!newDate) {
      Alert.alert('Error', 'Please enter a valid date (DD/MM/YYYY)');
      return;
    }
    const updatedExpenses = expenses.map((expense) =>
      expense.id === expenseId ? { ...expense, date: newDate } : expense
    );
    setExpenses(updatedExpenses);
    setEditingExpenseId(null);
    setShowDatePicker(false);
  };

  const openDatePickerForExpense = (expenseId: string) => {
    const expense = expenses.find((e) => e.id === expenseId);
    if (expense) {
      setSelectedDate(expense.date);
      setEditingExpenseId(expenseId);
      setShowDatePicker(true);
    }
  };

  const startEditingExpense = (expenseId: string) => {
    const expense = expenses.find((e) => e.id === expenseId);
    if (expense) {
      setEditingExpenseId(expenseId);
      setEditDescription(expense.description);
      setEditAmount(expense.amount.toString());
      setSelectedDate(expense.date);
      setIsEditingExpense(true);
    }
  };

  const saveEditedExpense = () => {
    if (!editDescription.trim() || !editAmount.trim()) {
      Alert.alert('Error', 'Please enter expense and amount');
      return;
    }

    const numAmount = parseFloat(editAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const updatedExpenses = expenses.map((expense) =>
      expense.id === editingExpenseId
        ? {
            ...expense,
            description: editDescription.trim(),
            amount: numAmount,
            date: selectedDate,
          }
        : expense
    );

    setExpenses(updatedExpenses);
    setIsEditingExpense(false);
    setShowDatePicker(false);
    setShowEditCalendar(false);
    setEditingExpenseId(null);
    setEditDescription('');
    setEditAmount('');
  };

  const cancelEdit = () => {
    setIsEditingExpense(false);
    setEditingExpenseId(null);
    setEditDescription('');
    setEditAmount('');
    setShowEditCalendar(false);
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    setSelectedDate(newDate);
    setDateInput(formatDateInput(newDate));
  };

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1);
    setSelectedDate(newDate);
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = (colorScheme: any, isCompact: boolean = false) => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    // Empty days
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarEmptyDay} />);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        day === selectedDate.getDate() &&
        selectedDate.getMonth() === new Date().getMonth() &&
        selectedDate.getFullYear() === new Date().getFullYear();

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            isCompact ? styles.calendarDayCompact : styles.calendarDay,
            day === selectedDate.getDate() && styles.calendarDaySelected,
          ]}
          onPress={() => handleDateSelect(day)}
        >
          <Text
            style={[
              isCompact ? styles.calendarDayTextCompact : styles.calendarDayText,
              { color: colorScheme.text },
              day === selectedDate.getDate() && styles.calendarDayTextSelected,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const sortedExpenses = [...expenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.bg }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>Expenses</Text>
          <TouchableOpacity
            style={[styles.themeToggle, { backgroundColor: colors.bgSecondary }]}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Text style={styles.themeToggleText}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.totalText, { color: colors.textSecondary }]}>Total</Text>
        <Text style={[styles.totalAmount, { color: '#34C759' }]}>${totalExpense.toFixed(2)}</Text>
      </View>

      {/* Input Section */}
      <View style={[styles.inputSection, { backgroundColor: colors.bgSecondary }]}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.input, 
            color: colors.inputText,
            borderColor: colors.border
          }]}
          placeholder="What did you buy?"
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          onFocus={() => setShowDatePicker(false)}
        />
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.input, 
            color: colors.inputText,
            borderColor: colors.border
          }]}
          placeholder="Amount"
          placeholderTextColor={colors.textSecondary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          onFocus={() => setShowDatePicker(false)}
        />

        {/* Date Picker Button */}
        <TouchableOpacity
          style={[styles.datePickerButton, { 
            backgroundColor: colors.bgSecondary,
            borderColor: colors.border
          }]}
          onPress={() => {
            Keyboard.dismiss();
            setEditingExpenseId(null);
            setShowDatePicker(true);
          }}
        >
          <Text style={[styles.datePickerButtonText, { color: colors.text }]}>
            📅 {formatDateLong(selectedDate)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={addExpense}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior="padding"
          style={[styles.modalContainer, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)' }]}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingExpenseId && !isEditingExpense ? 'Change Date' : isEditingExpense ? 'Select Date' : 'Select Date'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (isEditingExpense) {
                    // Edit modal'ı açıksa, date picker'ı kapat ama edit modal'ı açık bırak
                    setShowDatePicker(false);
                  } else if (editingExpenseId) {
                    // Kısa basıdan date picker açılmışsa
                    updateExpenseDate(editingExpenseId, dateInput);
                    setShowDatePicker(false);
                  } else {
                    // Add expense'den açılmışsa
                    setShowDatePicker(false);
                  }
                }}
              >
                <Text style={styles.modalConfirm}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Calendar */}
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  onPress={() => handleMonthChange(-1)}
                  style={styles.monthButton}
                >
                  <Text style={styles.monthButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.monthTitle, { color: colors.text }]}>
                  {selectedDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <TouchableOpacity
                  onPress={() => handleMonthChange(1)}
                  style={styles.monthButton}
                >
                  <Text style={styles.monthButtonText}>→</Text>
                </TouchableOpacity>
              </View>

              {/* Weekdays */}
              <View style={styles.weekdaysContainer}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} style={[styles.weekday, { color: colors.textSecondary }]}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.calendarWrapper}>
                <ScrollView contentContainerStyle={styles.daysGrid}>{renderCalendar(colors)}</ScrollView>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Expenses List */}
      <ScrollView style={[styles.listContainer, { backgroundColor: colors.bgSecondary }]}>
        {sortedExpenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No expenses yet</Text>
          </View>
        ) : (
          sortedExpenses.map((expense) => (
            <TouchableOpacity
              key={expense.id}
              onPress={() => startEditingExpense(expense.id)}
            >
              <View style={[styles.expenseItem, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
                <View style={styles.expenseInfo}>
                  <Text style={[styles.expenseDescription, { color: colors.text }]}>
                    {expense.description}
                  </Text>
                  <Text style={[styles.expenseDate, { color: colors.textSecondary }]}>
                    {formatDateLong(expense.date)}
                  </Text>
                </View>
                <View style={styles.expenseRight}>
                  <Text style={styles.expenseAmount}>
                    ${expense.amount.toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteExpense(expense.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Edit Expense Modal */}
      <Modal visible={isEditingExpense} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior="padding" 
          style={[styles.modalContainer, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)' }]}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => cancelEdit()}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Expense</Text>
              <TouchableOpacity onPress={() => saveEditedExpense()}>
                <Text style={styles.modalConfirm}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.calendarContainer, { paddingBottom: 20 }]}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.input, 
                  color: colors.inputText,
                  borderColor: colors.border,
                  marginBottom: 12
                }]}
                placeholder="What did you buy?"
                placeholderTextColor={colors.textSecondary}
                value={editDescription}
                onChangeText={setEditDescription}
                onFocus={() => setShowEditCalendar(false)}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.input, 
                  color: colors.inputText,
                  borderColor: colors.border,
                  marginBottom: 12
                }]}
                placeholder="Amount"
                placeholderTextColor={colors.textSecondary}
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="decimal-pad"
                onFocus={() => setShowEditCalendar(false)}
              />

              <TouchableOpacity
                style={[styles.datePickerButton, { 
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }]}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowEditCalendar(!showEditCalendar);
                }}
              >
                <Text style={[styles.datePickerButtonText, { color: colors.text }]}>
                  📅 {formatDateLong(selectedDate)}
                </Text>
              </TouchableOpacity>

              {/* Inline Calendar for Edit Modal */}
              {showEditCalendar && (
                <View style={[styles.calendarContainer, { marginTop: 12 }]}>
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity
                      onPress={() => handleMonthChange(-1)}
                      style={styles.monthButton}
                    >
                      <Text style={styles.monthButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={[styles.monthTitle, { color: colors.text }]}>
                      {selectedDate.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleMonthChange(1)}
                      style={styles.monthButton}
                    >
                      <Text style={styles.monthButtonText}>→</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Weekdays */}
                  <View style={styles.weekdaysContainer}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <Text key={day} style={[styles.weekday, { color: colors.textSecondary }]}>
                        {day}
                      </Text>
                    ))}
                  </View>

                  {/* Days Grid */}
                  <View style={styles.calendarWrapper}>
                    <ScrollView contentContainerStyle={styles.daysGrid}>{renderCalendar(colors, false)}</ScrollView>
                  </View>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomWidth: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggleText: {
    fontSize: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    letterSpacing: -1,
  },
  totalText: {
    fontSize: 15,
    color: '#86868B',
    fontWeight: '400',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    color: '#34C759',
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  inputSection: {
    backgroundColor: '#F5F5F7',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 0,
    marginTop: 0,
    borderRadius: 0,
    shadowColor: 'transparent',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
  },
  dateInputContainer: {
    marginBottom: 10,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    fontWeight: '400',
  },
  dateHint: {
    fontSize: 13,
    color: '#86868B',
    marginLeft: 16,
    fontWeight: '400',
  },
  addButton: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: 'transparent',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  datePickerButton: {
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 0,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: '#F5F5F7',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 17,
    color: '#86868B',
    fontWeight: '400',
  },
  expenseItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
    shadowColor: 'transparent',
    elevation: 0,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  expenseDescription: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  expenseDateButton: {
    paddingVertical: 4,
  },
  expenseDate: {
    fontSize: 13,
    color: '#86868B',
    fontWeight: '400',
  },
  expenseRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  expenseAmount: {
    fontSize: 17,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 12,
    maxHeight: '72%',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalCancel: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalConfirm: {
    fontSize: 16,
    color: '#34C759',
    fontWeight: '600',
  },
  modalLabel: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: '#000',
    marginVertical: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalHint: {
    fontSize: 13,
    color: '#86868B',
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: 24,
  },
  calendarContainer: {
    padding: 12,
  },
  calendarWrapper: {
    maxHeight: 280,
  },
  calendarContainerCompact: {
    padding: 4,
    backgroundColor: 'transparent',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarHeaderCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  monthButton: {
    padding: 8,
  },
  monthButtonCompact: {
    padding: 4,
  },
  monthButtonText: {
    fontSize: 20,
    color: '#34C759',
    fontWeight: '600',
  },
  monthButtonTextCompact: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  monthTitleCompact: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekdaysContainerCompact: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 3,
  },
  weekday: {
    fontSize: 13,
    fontWeight: '600',
    color: '#86868B',
    width: '14.28%',
    textAlign: 'center',
  },
  weekdayCompact: {
    fontSize: 9,
    fontWeight: '600',
    color: '#86868B',
    width: '14.28%',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 0.86,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderRadius: 8,
  },
  calendarDayCompact: {
    width: '14.28%',
    aspectRatio: 0.86,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    borderRadius: 6,
  },
  calendarDaySelected: {
    backgroundColor: '#34C759',
  },
  calendarDayText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  calendarDayTextCompact: {
    fontSize: 11,
    fontWeight: '500',
    color: '#000',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarEmptyDay: {
    width: '14.28%',
    aspectRatio: 0.86,
  },
});
