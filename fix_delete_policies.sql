-- Enable DELETE policies for users to delete their own data

-- Marketplace Items
create policy "Users can delete their own items"
on marketplace_items for delete
using ( auth.uid() = seller_id );

-- Skill Swaps
create policy "Users can delete their own skills"
on skill_swaps for delete
using ( auth.uid() = user_id );

-- Project Partners (DevMatch)
create policy "Users can delete their own projects"
on project_partners for delete
using ( auth.uid() = poster_id );

-- Gig Works (Just in case)
create policy "Users can delete their own gigs"
on gig_works for delete
using ( auth.uid() = user_id );

-- Feed Posts (Just in case)
create policy "Users can delete their own posts"
on feed_posts for delete
using ( auth.uid() = user_id );
