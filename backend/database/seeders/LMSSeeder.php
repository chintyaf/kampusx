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

            // User ID 2 sebagai Learning Path creator.
            $userId = 2;

            $userExists = DB::table('users')
                ->where('id', $userId)
                ->exists();

            if (!$userExists) {
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
                    'description' => 'Learn the fundamentals of Python programming, including variables, data types, and basic programming concepts.',
                    'category' => 'Programming',
                    'categories' => json_encode([
                        'Programming',
                        'Technology',
                        'Python',
                    ]),
                    'thumbnail' => null,
                    'status' => 'published',
                    'created_at' => $now,
                    'updated_at' => $now,
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

                    'content' => <<<'HTML'
<h2>Variables in Python</h2>

<p>
    A variable is a named reference used to store data.
    Variables allow programmers to store and manipulate
    information throughout a program.
</p>

<h3>Example</h3>

<pre><code>name = "Chintya"
age = 21
height = 160.5
is_student = True</code></pre>

<h2>Basic Data Types</h2>

<ul>
    <li><strong>String:</strong> Used to store text data.</li>
    <li><strong>Integer:</strong> Used to store whole numbers.</li>
    <li><strong>Float:</strong> Used to store decimal numbers.</li>
    <li><strong>Boolean:</strong> Used to store True or False values.</li>
</ul>

<h2>Summary</h2>

<p>
    Python variables store data, while data types determine
    the kind of value that a variable can contain.
</p>
HTML,

                    'summary' => 'Learn how to declare variables and identify basic Python data types such as String, Integer, Float, and Boolean.',

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

            $lessonId = DB::table('lessons')
                ->where('module_id', $moduleId)
                ->where('title', 'Variables and Data Types')
                ->value('id');

            /*
            |--------------------------------------------------------------------------
            | 4. QUIZ
            |--------------------------------------------------------------------------
            */

            DB::table('quizzes')->updateOrInsert(
                [
                    'module_id' => $moduleId,
                    'title' => 'Python Fundamentals Quiz',
                ],
                [
                    'lesson_id' => null,
                    'description' => 'Assess your understanding of Python variables and basic data types.',
                    'bloom_level' => 'Understanding',
                    'time_limit_minutes' => 10,
                    'passing_score' => 70.00,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );

            $quizId = DB::table('quizzes')
                ->where('module_id', $moduleId)
                ->where('title', 'Python Fundamentals Quiz')
                ->value('id');

            /*
            |--------------------------------------------------------------------------
            | 5. QUIZ QUESTION
            |--------------------------------------------------------------------------
            */

            DB::table('quiz_questions')->updateOrInsert(
                [
                    'quiz_id' => $quizId,
                    'question_text' => 'Which data type is used to store whole numbers in Python?',
                ],
                [
                    'bloom_level' => 'Remembering',
                    'explanation' => 'The int data type represents integer values or whole numbers in Python.',
                    'order_index' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );

            $questionId = DB::table('quiz_questions')
                ->where('quiz_id', $quizId)
                ->where(
                    'question_text',
                    'Which data type is used to store whole numbers in Python?'
                )
                ->value('id');

            /*
            |--------------------------------------------------------------------------
            | 6. QUESTION OPTIONS
            |--------------------------------------------------------------------------
            */

            $options = [
                [
                    'option_label' => 'A',
                    'option_text' => 'String',
                    'is_correct' => false,
                    'order_index' => 1,
                ],
                [
                    'option_label' => 'B',
                    'option_text' => 'Float',
                    'is_correct' => false,
                    'order_index' => 2,
                ],
                [
                    'option_label' => 'C',
                    'option_text' => 'Integer',
                    'is_correct' => true,
                    'order_index' => 3,
                ],
                [
                    'option_label' => 'D',
                    'option_text' => 'Boolean',
                    'is_correct' => false,
                    'order_index' => 4,
                ],
            ];

            foreach ($options as $option) {
                DB::table('question_options')->updateOrInsert(
                    [
                        'question_id' => $questionId,
                        'option_label' => $option['option_label'],
                    ],
                    [
                        'option_text' => $option['option_text'],
                        'is_correct' => $option['is_correct'],
                        'order_index' => $option['order_index'],
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            }
        });

        $this->command->info('LMS dummy data seeded successfully.');
    }
}
