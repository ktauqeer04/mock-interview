/**
 * In-memory database for mock interview app.
 * Stores rooms, participants, and question completion status.
 */

// Rooms: { roomId: { createdAt, creatorEmail, peerEmail?, questionId?, expiresAt } }
const rooms = new Map();

// Session results: { roomId: { [email]: { [questionId]: boolean } } }
const sessionResults = new Map();

// 10 Easy DSA Questions with 10 test cases each (2-3 visible)
const questions = [
  {
    id: 1,
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
    difficulty: "easy",
    funcName: "twoSum",
    paramNames: ["nums", "target"],
    template: `function twoSum(nums, target) {
  // Write your code here
  return [];
}`,
    testCases: [
      { inputs: [[2, 7, 11, 15], 9], expected: [0, 1], visible: true },
      { inputs: [[3, 2, 4], 6], expected: [1, 2], visible: true },
      { inputs: [[3, 3], 6], expected: [0, 1], visible: true },
      { inputs: [[1, 2, 3, 4], 7], expected: [2, 3], visible: false },
      { inputs: [[0, 4, 3, 0], 0], expected: [0, 3], visible: false },
      { inputs: [[-1, -2, -3, -4], -6], expected: [1, 3], visible: false },
      { inputs: [[5, 3, 2, 7], 10], expected: [0, 3], visible: false },
      { inputs: [[1, 5, 3, 7], 12], expected: [1, 3], visible: false },
      { inputs: [[10, 20, 30], 50], expected: [1, 2], visible: false },
      { inputs: [[1, 2, 3, 4, 5], 9], expected: [3, 4], visible: false },
    ],
  },
  {
    id: 2,
    title: "Valid Parentheses",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

Example:
Input: s = "()"
Output: true`,
    difficulty: "easy",
    funcName: "isValid",
    paramNames: ["s"],
    template: `function isValid(s) {
  // Write your code here
  return false;
}`,
    testCases: [
      { inputs: ["()"], expected: true, visible: true },
      { inputs: ["()[]{}"], expected: true, visible: true },
      { inputs: ["(]"], expected: false, visible: true },
      { inputs: ["([)]"], expected: false, visible: false },
      { inputs: ["{[]}"], expected: true, visible: false },
      { inputs: [""], expected: true, visible: false },
      { inputs: ["["], expected: false, visible: false },
      { inputs: ["(])"], expected: false, visible: false },
      { inputs: ["((){})"], expected: true, visible: false },
      { inputs: ["([{}])"], expected: true, visible: false },
    ],
  },
  {
    id: 3,
    title: "Palindrome Number",
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.

A palindrome number reads the same backward as forward.

Example:
Input: x = 121
Output: true

Input: x = -121
Output: false (reads 121- from right to left)`,
    difficulty: "easy",
    funcName: "isPalindrome",
    paramNames: ["x"],
    template: `function isPalindrome(x) {
  // Write your code here
  return false;
}`,
    testCases: [
      { inputs: [121], expected: true, visible: true },
      { inputs: [-121], expected: false, visible: true },
      { inputs: [10], expected: false, visible: true },
      { inputs: [0], expected: true, visible: false },
      { inputs: [12321], expected: true, visible: false },
      { inputs: [12345], expected: false, visible: false },
      { inputs: [1], expected: true, visible: false },
      { inputs: [22], expected: true, visible: false },
      { inputs: [1001], expected: true, visible: false },
      { inputs: [100], expected: false, visible: false },
    ],
  },
  {
    id: 4,
    title: "Contains Duplicate",
    description: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.

Example:
Input: nums = [1, 2, 3, 1]
Output: true`,
    difficulty: "easy",
    funcName: "containsDuplicate",
    paramNames: ["nums"],
    template: `function containsDuplicate(nums) {
  // Write your code here
  return false;
}`,
    testCases: [
      { inputs: [[1, 2, 3, 1]], expected: true, visible: true },
      { inputs: [[1, 2, 3, 4]], expected: false, visible: true },
      { inputs: [[1, 1, 1, 3, 3]], expected: true, visible: true },
      { inputs: [[]], expected: false, visible: false },
      { inputs: [[1]], expected: false, visible: false },
      { inputs: [[1, 1]], expected: true, visible: false },
      { inputs: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 1]], expected: true, visible: false },
      { inputs: [[-1, -2, -1]], expected: true, visible: false },
      { inputs: [[1, 2, 3, 4, 5]], expected: false, visible: false },
      { inputs: [[2, 2, 3, 3]], expected: true, visible: false },
    ],
  },
  {
    id: 5,
    title: "Best Time to Buy and Sell Stock",
    description: `You are given an array prices where prices[i] is the price of a given stock on the i-th day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

Example:
Input: prices = [7, 1, 5, 3, 6, 4]
Output: 5 (buy at 1, sell at 6)`,
    difficulty: "easy",
    funcName: "maxProfit",
    paramNames: ["prices"],
    template: `function maxProfit(prices) {
  // Write your code here
  return 0;
}`,
    testCases: [
      { inputs: [[7, 1, 5, 3, 6, 4]], expected: 5, visible: true },
      { inputs: [[7, 6, 4, 3, 1]], expected: 0, visible: true },
      { inputs: [[1, 2]], expected: 1, visible: true },
      { inputs: [[2, 4, 1]], expected: 2, visible: false },
      { inputs: [[3, 2, 6, 5, 0, 3]], expected: 4, visible: false },
      { inputs: [[1]], expected: 0, visible: false },
      { inputs: [[1, 2, 3, 4, 5]], expected: 4, visible: false },
      { inputs: [[5, 4, 3, 2, 1]], expected: 0, visible: false },
      { inputs: [[2, 1, 2, 1, 0, 1]], expected: 1, visible: false },
      { inputs: [[1, 2, 4, 2, 5]], expected: 4, visible: false },
    ],
  },
  {
    id: 6,
    title: "Climbing Stairs",
    description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

Example:
Input: n = 2
Output: 2 (1+1 or 2)

Input: n = 3
Output: 3 (1+1+1, 1+2, 2+1)`,
    difficulty: "easy",
    funcName: "climbStairs",
    paramNames: ["n"],
    template: `function climbStairs(n) {
  // Write your code here
  return 0;
}`,
    testCases: [
      { inputs: [2], expected: 2, visible: true },
      { inputs: [3], expected: 3, visible: true },
      { inputs: [1], expected: 1, visible: true },
      { inputs: [4], expected: 5, visible: false },
      { inputs: [5], expected: 8, visible: false },
      { inputs: [6], expected: 13, visible: false },
      { inputs: [7], expected: 21, visible: false },
      { inputs: [10], expected: 89, visible: false },
      { inputs: [15], expected: 987, visible: false },
      { inputs: [20], expected: 10946, visible: false },
    ],
  },
  {
    id: 7,
    title: "Single Number",
    description: `Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.

You must implement a solution with a linear runtime complexity and use only constant extra space.

Example:
Input: nums = [2, 2, 1]
Output: 1

Input: nums = [4, 1, 2, 1, 2]
Output: 4`,
    difficulty: "easy",
    funcName: "singleNumber",
    paramNames: ["nums"],
    template: `function singleNumber(nums) {
  // Write your code here
  return 0;
}`,
    testCases: [
      { inputs: [[2, 2, 1]], expected: 1, visible: true },
      { inputs: [[4, 1, 2, 1, 2]], expected: 4, visible: true },
      { inputs: [[1]], expected: 1, visible: true },
      { inputs: [[1, 1, 2]], expected: 2, visible: false },
      { inputs: [[3, 3, 4, 4, 5]], expected: 5, visible: false },
      { inputs: [[7, 8, 7, 8, 9]], expected: 9, visible: false },
      { inputs: [[-1, -1, -2]], expected: -2, visible: false },
      { inputs: [[0, 1, 0]], expected: 1, visible: false },
      { inputs: [[5, 5, 6, 6, 7]], expected: 7, visible: false },
      { inputs: [[10, 20, 10]], expected: 20, visible: false },
    ],
  },
  {
    id: 8,
    title: "Maximum Subarray",
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

Example:
Input: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Output: 6 (subarray [4, -1, 2, 1])`,
    difficulty: "easy",
    funcName: "maxSubArray",
    paramNames: ["nums"],
    template: `function maxSubArray(nums) {
  // Write your code here
  return 0;
}`,
    testCases: [
      { inputs: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6, visible: true },
      { inputs: [[1]], expected: 1, visible: true },
      { inputs: [[5, 4, -1, 7, 8]], expected: 23, visible: true },
      { inputs: [[-1, -2, -3]], expected: -1, visible: false },
      { inputs: [[1, 2, 3, 4]], expected: 10, visible: false },
      { inputs: [[-2, -1]], expected: -1, visible: false },
      { inputs: [[2, -1, 3]], expected: 4, visible: false },
      { inputs: [[1, -1, 1, -1, 1]], expected: 1, visible: false },
      { inputs: [[8, -19, 5, -4, 20]], expected: 21, visible: false },
      { inputs: [[1, 2, -1, -2, 3]], expected: 3, visible: false },
    ],
  },
  {
    id: 9,
    title: "Fizz Buzz",
    description: `Given an integer n, return a string array answer where:
- answer[i] == "FizzBuzz" if i is divisible by 3 and 5
- answer[i] == "Fizz" if i is divisible by 3
- answer[i] == "Buzz" if i is divisible by 5
- answer[i] == i (as string) otherwise

Note: i is 1-indexed (1 to n).

Example:
Input: n = 15
Output: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]`,
    difficulty: "easy",
    funcName: "fizzBuzz",
    paramNames: ["n"],
    template: `function fizzBuzz(n) {
  // Write your code here
  return [];
}`,
    testCases: [
      { inputs: [3], expected: ["1", "2", "Fizz"], visible: true },
      { inputs: [5], expected: ["1", "2", "Fizz", "4", "Buzz"], visible: true },
      { inputs: [15], expected: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"], visible: true },
      { inputs: [1], expected: ["1"], visible: false },
      { inputs: [6], expected: ["1","2","Fizz","4","Buzz","Fizz"], visible: false },
      { inputs: [10], expected: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz"], visible: false },
      { inputs: [2], expected: ["1","2"], visible: false },
      { inputs: [7], expected: ["1","2","Fizz","4","Buzz","Fizz","7"], visible: false },
      { inputs: [9], expected: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz"], visible: false },
      { inputs: [20], expected: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz","16","17","Fizz","19","Buzz"], visible: false },
    ],
  },
  {
    id: 10,
    title: "Roman to Integer",
    description: `Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M.

Symbol -> Value: I=1, V=5, X=10, L=50, C=100, D=500, M=1000

For example, 2 is written as II, 12 is XII, 27 is XXVII. The rule: when a smaller numeral is before a larger one, subtract it (e.g. IV=4, IX=9).

Given a roman numeral string, convert it to an integer.

Example:
Input: s = "III"
Output: 3`,
    difficulty: "easy",
    funcName: "romanToInt",
    paramNames: ["s"],
    template: `function romanToInt(s) {
  // Write your code here
  return 0;
}`,
    testCases: [
      { inputs: ["III"], expected: 3, visible: true },
      { inputs: ["LVIII"], expected: 58, visible: true },
      { inputs: ["MCMXCIV"], expected: 1994, visible: true },
      { inputs: ["I"], expected: 1, visible: false },
      { inputs: ["IV"], expected: 4, visible: false },
      { inputs: ["IX"], expected: 9, visible: false },
      { inputs: ["XL"], expected: 40, visible: false },
      { inputs: ["XC"], expected: 90, visible: false },
      { inputs: ["CD"], expected: 400, visible: false },
      { inputs: ["MMMCMXCIX"], expected: 3999, visible: false },
    ],
  },
];

const ROOM_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function generateRoomId() {
  return Math.random().toString(36).substring(2, 10);
}

function createRoom(creatorEmail) {
  const roomId = generateRoomId();
  const now = Date.now();
  const room = {
    roomId,
    creatorEmail,
    peerEmail: null,
    questionId: null,
    createdAt: now,
    expiresAt: now + ROOM_EXPIRY_MS,
  };
  rooms.set(roomId, room);
  sessionResults.set(roomId, { [creatorEmail]: {} });
  return room;
}

function joinRoom(roomId, peerEmail) {
  const room = rooms.get(roomId);
  if (!room) return { success: false, error: "Room not found" };
  if (room.expiresAt < Date.now()) return { success: false, error: "Room has expired" };
  if (room.peerEmail) return { success: false, error: "Room is full" };
  if (room.creatorEmail === peerEmail) return { success: false, error: "Cannot join your own room" };

  room.peerEmail = peerEmail;
  const results = sessionResults.get(roomId);
  results[peerEmail] = {};
  sessionResults.set(roomId, results);

  // Assign random question when both are in
  const questionIndex = Math.floor(Math.random() * questions.length);
  room.questionId = questions[questionIndex].id;

  return { success: true, room };
}

function getRoom(roomId) {
  return rooms.get(roomId);
}

function getQuestionById(id) {
  return questions.find((q) => q.id === id);
}

function getRandomQuestion() {
  return questions[Math.floor(Math.random() * questions.length)];
}

function recordQuestionResult(roomId, email, questionId, solved) {
  const results = sessionResults.get(roomId);
  if (!results) return;
  if (!results[email]) results[email] = {};
  results[email][questionId] = solved;
  sessionResults.set(roomId, results);
}

function getSessionResults(roomId) {
  return sessionResults.get(roomId) || {};
}

function cleanupExpiredRooms() {
  const now = Date.now();
  for (const [roomId, room] of rooms.entries()) {
    if (room.expiresAt < now) {
      rooms.delete(roomId);
      sessionResults.delete(roomId);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredRooms, 5 * 60 * 1000);

export {
  rooms,
  sessionResults,
  questions,
  createRoom,
  joinRoom,
  getRoom,
  getQuestionById,
  getRandomQuestion,
  recordQuestionResult,
  getSessionResults,
  ROOM_EXPIRY_MS,
};
