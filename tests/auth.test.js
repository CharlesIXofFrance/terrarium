import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
    try {
        // Test 1: Sign Up
        console.log('Test 1: Sign Up')
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'test@example.com',
            password: 'testpassword123',
            options: {
                data: {
                    full_name: 'Test User'
                }
            }
        })
        
        if (signUpError) throw signUpError
        console.log('Sign Up successful:', signUpData)

        // Test 2: Sign In
        console.log('\nTest 2: Sign In')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: 'test@example.com',
            password: 'testpassword123'
        })
        
        if (signInError) throw signInError
        console.log('Sign In successful:', signInData)

        // Test 3: Get User Profile
        console.log('\nTest 3: Get User Profile')
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signInData.user.id)
            .single()
        
        if (profileError) throw profileError
        console.log('Profile retrieved:', profile)

        // Test 4: Update Profile
        console.log('\nTest 4: Update Profile')
        const { data: updateData, error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: 'https://example.com/avatar.jpg' })
            .eq('id', signInData.user.id)
            .select()
        
        if (updateError) throw updateError
        console.log('Profile updated:', updateData)

        // Test 5: Sign Out
        console.log('\nTest 5: Sign Out')
        const { error: signOutError } = await supabase.auth.signOut()
        
        if (signOutError) throw signOutError
        console.log('Sign Out successful')

    } catch (error) {
        console.error('Error during authentication test:', error.message)
    }
}

// Run the tests
testAuth()
