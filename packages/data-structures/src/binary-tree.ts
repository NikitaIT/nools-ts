import { Tree, ITreeNode, Dir } from "./tree";

export class BinaryTree<T> extends Tree<T> {
  insert(data: T) {
    if (!this.root) {
      // @ts-ignore
      this.setRoot({
        data: data,
        parent: null,
        left: null,
        right: null,
      });
      return this.root;
    }
    const compare = this.compare;
    let root = this.root;
    while (root !== null) {
      const cmp = compare(data, root.data);
      if (cmp) {
        const leaf = cmp === -1 ? "left" : "right";
        const next = root[leaf] as ITreeNode<T>;
        if (!next) {
          return (root[leaf] = {
            data: data,
            parent: root,
            left: null,
            right: null,
          });
        } else {
          root = next;
        }
      } else {
        return;
      }
    }
  }
  remove(data: T) {
    if (this.root !== null) {
      const head = ({ right: this.root } as any) as ITreeNode<T>;
      let it = head;
      let p: ITreeNode<T>,
        f: ITreeNode<T> | null = null;
      let dir: Dir = "right";
      while (it[dir] !== null) {
        p = it;
        it = it[dir] as ITreeNode<T>;
        const cmp = this.compare(data, it.data);
        if (!cmp) {
          f = it;
        }
        dir = cmp === -1 ? "left" : "right";
      }
      if (f !== null) {
        f.data = it.data;
        // @ts-ignore
        p[p.right === it ? "right" : "left"] = it[it.left === null ? "right" : "left"];
      }
      // @ts-ignore
      this.setRoot(head.right);
    }
  }
}
