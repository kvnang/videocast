import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';

export async function getProject(_id: string, userID?: string | null) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('projects');
  const query: { _id: ObjectId; userID?: string | null; isPublic?: boolean } = {
    _id: new ObjectId(_id),
  };
  if (userID) {
    query.userID = userID;
  } else {
    query.isPublic = true;
  }
  const result = await collection.findOne(query);

  return JSON.parse(JSON.stringify(result)); // This is to serialize _id: ObjectId(). Is there a better way?
}
