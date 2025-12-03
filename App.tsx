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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

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

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    // Boş günler
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarEmptyDay} />);
    }

    // Günler
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        day === selectedDate.getDate() &&
        selectedDate.getMonth() === new Date().getMonth() &&
        selectedDate.getFullYear() === new Date().getFullYear();

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            day === selectedDate.getDate() && styles.calendarDaySelected,
          ]}
          onPress={() => handleDateSelect(day)}
        >
          <Text
            style={[
              styles.calendarDayText,
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
    <View style={styles.container}>
      <StatusBar barStyle="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <Text style={styles.totalText}>Total</Text>
        <Text style={styles.totalAmount}>${totalExpense.toFixed(2)}</Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="What did you buy?"
          placeholderTextColor="#CCC"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#CCC"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        {/* Date Picker Button */}
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => {
            setEditingExpenseId(null);
            setShowDatePicker(true);
          }}
        >
          <Text style={styles.datePickerButtonText}>
            📅 {formatDateLong(selectedDate)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={addExpense}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingExpenseId ? 'Change Date' : 'Select Date'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (editingExpenseId) {
                    updateExpenseDate(editingExpenseId, dateInput);
                  }
                  setShowDatePicker(false);
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
                <Text style={styles.monthTitle}>
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
                  <Text key={day} style={styles.weekday}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>{renderCalendar()}</View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Expenses List */}
      <ScrollView style={styles.listContainer}>
        {sortedExpenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses yet</Text>
          </View>
        ) : (
          sortedExpenses.map((expense) => (
            <View key={expense.id} style={styles.expenseItem}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseDescription}>
                  {expense.description}
                </Text>
                <TouchableOpacity
                  onPress={() => openDatePickerForExpense(expense.id)}
                  style={styles.expenseDateButton}
                >
                  <Text style={styles.expenseDate}>
                    {formatDateLong(expense.date)}
                  </Text>
                </TouchableOpacity>
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
          ))
        )}
      </ScrollView>
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
    marginBottom: 10,
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
    marginBottom: 10,
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
    paddingBottom: 50,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
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
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthButton: {
    padding: 8,
  },
  monthButtonText: {
    fontSize: 20,
    color: '#34C759',
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekday: {
    fontSize: 13,
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
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 8,
  },
  calendarDaySelected: {
    backgroundColor: '#34C759',
  },
  calendarDayText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarEmptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
});
