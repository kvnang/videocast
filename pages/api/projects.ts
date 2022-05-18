import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';
// import { StylesProps } from '../../components/forms/StylesForm';
import clientPromise from '../../lib/mongodb';
import { ProjectDocument } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('projects');

  if (req.method === 'POST') {
    const body = JSON.parse(req.body);

    if (!body) {
      throw new Error('No data posted');
    }

    if (!body.userID) {
      throw new Error('No user ID provided');
    }

    try {
      const result = await collection.insertOne({
        ...body,
        date: new Date(),
        updatedAt: new Date(),
      });
      res.status(200).json(result);
      return;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const body = JSON.parse(req.body);

    if (!body) {
      throw new Error('No data posted');
    }

    if (!body._id) {
      throw new Error('No object ID is found');
    }

    if (!body.userID) {
      throw new Error('No user ID provided');
    }

    const { _id, userID, ...params } = body;
    console.log(params);
    try {
      const result = await collection.updateOne(
        { _id: new ObjectId(_id), userID },
        { $set: { ...params, updatedAt: new Date() } }
      );

      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  if (req.method === 'GET') {
    const {
      query: { userID, _id },
    } = req;

    if (!userID) {
      throw new Error('No user ID provided');
    }

    const params = {
      userID,
      trashed: {
        $ne: true,
      },
    };

    try {
      if (_id) {
        const result = await collection.findOne({
          ...params,
          _id: new ObjectId(_id),
        });
        res.status(200).json(result);
      } else {
        const result = await collection
          .find(params)
          .sort({ date: -1 })
          .toArray();
        res.status(200).json(result);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
