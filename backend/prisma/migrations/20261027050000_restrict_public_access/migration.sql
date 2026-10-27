-- Express authenticates users and connects through the server database role.
-- Application tables must not be exposed through Supabase's anonymous Data API.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Trip" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Destination" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TripStop" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Activity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TripActivity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunityPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Like" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SavedTrip" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "User", "Trip", "Destination", "TripStop", "Activity", "TripActivity", "Expense", "CommunityPost", "Comment", "Like", "SavedTrip", "_prisma_migrations" FROM anon, authenticated;
