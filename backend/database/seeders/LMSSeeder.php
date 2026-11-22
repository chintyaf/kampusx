<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use RuntimeException;

class LMSSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $now = Carbon::now();
            $userId = 3;

            // Validate user
            if (!DB::table('users')->where('id', $userId)->exists()) {
                throw new RuntimeException(
                    "User with ID {$userId} does not exist."
                );
            }

            /*
            |--------------------------------------------------------------------------
            | 1. LEARNING PATH
            |--------------------------------------------------------------------------
            */

            DB::table('learning_paths')->updateOrInsert(
                [
                    'created_by' => $userId,
                    'title' => 'Fundamentals of Python Programming',
                ],
                [
                    'event_id' => null,
                    'slug' => 'fundamentals-of-python-programming',
                    'description' => 'Learn the fundamentals of Python programming, including variables, data types, and basic programming concepts.',
                    'category' => 'Programming',
                    'categories' => json_encode([
                        'Programming',
                        'Technology',
                        'Python',
                    ]),
                    'thumbnail' => null,
                    'status' => 'published',
                    'published_at' => $now,
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );

            $learningPathId = DB::table('learning_paths')
                ->where('created_by', $userId)
                ->where('title', 'Fundamentals of Python Programming')
                ->value('id');

            /*
            |--------------------------------------------------------------------------
            | 2. MODULE
            |--------------------------------------------------------------------------
            */

            DB::table('modules')->updateOrInsert(
                [
                    'learning_path_id' => $learningPathId,
                    'title' => 'Introduction to Python',
                ],
                [
                    'description' => 'Understand Python fundamentals, syntax, variables, and basic data types.',
                    'learning_outcomes' => json_encode([
                        'Understand the basic concepts of Python programming.',
                        'Identify Python syntax and basic programming structures.',
                        'Declare variables and use basic data types.',
                    ]),
                    'difficulty_level' => 'beginner',
                    'order_index' => 1,
                    'status' => 'published',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );

            $moduleId = DB::table('modules')
                ->where('learning_path_id', $learningPathId)
                ->where('title', 'Introduction to Python')
                ->value('id');

            /*
            |--------------------------------------------------------------------------
            | 3. LESSON
            |--------------------------------------------------------------------------
            */

            DB::table('lessons')->updateOrInsert(
                [
                    'module_id' => $moduleId,
                    'title' => 'Variables and Data Types',
                ],
                [
                    'type' => 'microlearning',

                    'content' => <<<'MARKDOWN'
# Variables and Data Types

## 1. Variables in Python

A **variable** is a named reference used to store data. Variables allow programmers to store and manipulate information throughout a program.

Variables are created when a value is assigned using the assignment operator (`=`).

### Example

```python
name = "Chintya"
age = 21
height = 160.5
is_student = True
```

In the example above:

- `name` stores a text value.
- `age` stores a whole number.
- `height` stores a decimal number.
- `is_student` stores a Boolean value.

## 2. Basic Data Types

Python provides several built-in data types to represent different kinds of values.

| Data Type | Description | Example |
|---|---|---|
| String (`str`) | Stores text data. | `"Hello"` |
| Integer (`int`) | Stores whole numbers. | `21` |
| Float (`float`) | Stores decimal numbers. | `160.5` |
| Boolean (`bool`) | Stores `True` or `False`. | `True` |

### Example

```python
student_name = "Chintya"
student_age = 21
student_height = 160.5
is_enrolled = True

print(student_name)
print(student_age)
print(student_height)
print(is_enrolled)
```

## 3. Checking Data Types

Python provides the `type()` function to identify the data type of a variable.

### Example

```python
name = "Chintya"
age = 21

print(type(name))  # <class 'str'>
print(type(age))   # <class 'int'>
```

## 4. Summary

- Variables are used to store and reference data.
- Python uses the `=` operator to assign values.
- Data types determine the kind of value stored in a variable.
- Common data types include String, Integer, Float, and Boolean.
- The `type()` function identifies the data type of a variable.

## 5. Reflection

Consider the following questions:

1. What is the difference between an Integer and a Float?
2. Why are variables important in programming?
3. What data type would you use to store a student's enrollment status?
MARKDOWN,

                    'summary' => 'Learn how to declare variables, identify basic Python data types, and use the type() function.',
                    'order_index' => 1,
                    'duration_minutes' => 8,
                    'xp' => 15,
                    'video_url' => null,
                    'attachments' => null,
                    'status' => 'published',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | 4. QUIZ
            |--------------------------------------------------------------------------
            */

            DB::table('quizzes')->updateOrInsert(
                [
                    'module_id' => $moduleId,
                ],
                [
                    'title' => 'Python Fundamentals Quiz',
                    'description' => 'Assess your understanding of Python variables and basic data types.',
                    'bloom_level' => 'Understanding',
                    'time_limit_minutes' => 10,
                    'passing_score' => 70.00,
                    'is_published' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );

            $quizId = DB::table('quizzes')
                ->where('module_id', $moduleId)
                ->value('id');

            /*
            |--------------------------------------------------------------------------
            | 5. QUIZ QUESTIONS & OPTIONS
            |--------------------------------------------------------------------------
            */

            $questions = [
                [
                    'question_text' => 'Which data type is used to store whole numbers in Python?',
                    'bloom_level' => 'Remembering',
                    'explanation' => 'The int data type represents integer values or whole numbers in Python.',
                    'options' => [
                        ['A', 'String', false],
                        ['B', 'Float', false],
                        ['C', 'Integer', true],
                        ['D', 'Boolean', false],
                    ],
                ],
                [
                    'question_text' => 'Which Python function is used to identify the data type of a variable?',
                    'bloom_level' => 'Remembering',
                    'explanation' => 'The type() function returns the data type of a given object.',
                    'options' => [
                        ['A', 'print()', false],
                        ['B', 'type()', true],
                        ['C', 'input()', false],
                        ['D', 'str()', false],
                    ],
                ],
                [
                    'question_text' => 'Which variable declaration stores a Boolean value?',
                    'bloom_level' => 'Understanding',
                    'explanation' => 'Boolean values in Python are represented by True and False.',
                    'options' => [
                        ['A', 'age = 21', false],
                        ['B', 'name = "Python"', false],
                        ['C', 'height = 160.5', false],
                        ['D', 'is_student = True', true],
                    ],
                ],
            ];

            foreach ($questions as $index => $question) {
                $order = $index + 1;

                DB::table('quiz_questions')->updateOrInsert(
                    [
                        'quiz_id' => $quizId,
                        'order_index' => $order,
                    ],
                    [
                        'question_text' => $question['question_text'],
                        'bloom_level' => $question['bloom_level'],
                        'explanation' => $question['explanation'],
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );

                $questionId = DB::table('quiz_questions')
                    ->where('quiz_id', $quizId)
                    ->where('order_index', $order)
                    ->value('id');

                foreach ($question['options'] as $optionIndex => $option) {
                    DB::table('question_options')->updateOrInsert(
                        [
                            'question_id' => $questionId,
                            'option_label' => $option[0],
                        ],
                        [
                            'option_text' => $option[1],
                            'is_correct' => $option[2],
                            'order_index' => $optionIndex + 1,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]
                    );
                }
            }

        });

        $this->command->info('LMS dummy data seeded successfully.');
    }
}
